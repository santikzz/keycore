<?php

namespace App\Http\Controllers;

use App\Enums\Codes;
use App\Models\License;
use App\Models\Product;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class LicenseController extends Controller
{

    private const RATE_LIMIT_KEY = 'license_check';
    private const RATE_LIMIT_ATTEMPTS = 5;
    private const RATE_LIMIT_DECAY = 60; // seconds
    private const CACHE_TTL = 300; // 5 minutes
    private const RATE_LIMIT_ATTEMPTS_PER_LICENSE = 10; // per license key
    private const RATE_LIMIT_ATTEMPTS_PER_HWID = 15; // per hardware ID


    private static function createLicenseKey()
    {
        // create a random license key in the format XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
        // Using 24 random bytes (192 bits of entropy) for maximum security
        $key = strtoupper(bin2hex(random_bytes(24)));
        return substr($key, 0, 4) . '-' . 
               substr($key, 4, 4) . '-' . 
               substr($key, 8, 4) . '-' . 
               substr($key, 12, 4) . '-' . 
               substr($key, 16, 4) . '-' . 
               substr($key, 20, 4);
    }

    public function check(Request $request)
    {
        // Multi-layer rate limiting to prevent abuse
        $clientIp = $request->ip();
        $licenseKey = $request->input('key', '');
        $hwid = $request->input('hwid', '');
        
        // Create multiple rate limiting keys for different attack vectors
        $rateLimitChecks = [
            ['key' => 'ip:' . $clientIp, 'limit' => self::RATE_LIMIT_ATTEMPTS],
            ['key' => 'license:' . hash('sha256', $licenseKey), 'limit' => self::RATE_LIMIT_ATTEMPTS_PER_LICENSE],
            ['key' => 'hwid:' . hash('sha256', $hwid), 'limit' => self::RATE_LIMIT_ATTEMPTS_PER_HWID],
        ];

        // Check rate limits for each key with specific limits
        foreach ($rateLimitChecks as $check) {
            $fullKey = self::RATE_LIMIT_KEY . ':' . $check['key'];
            if (RateLimiter::tooManyAttempts($fullKey, $check['limit'])) {
                // Log potential abuse
                Log::warning('Rate limit exceeded', [
                    'key_type' => explode(':', $check['key'])[0],
                    'ip' => $clientIp,
                    'user_agent' => $request->userAgent(),
                ]);
                return response()->json(['error' => 'too_many_requests'], 429);
            }
        }

        // Hit all rate limiters
        foreach ($rateLimitChecks as $check) {
            $fullKey = self::RATE_LIMIT_KEY . ':' . $check['key'];
            RateLimiter::hit($fullKey, self::RATE_LIMIT_DECAY);
        }

        // ssl check
        if (!$request->secure() && !app()->environment('local')) {
            return response()->json(['error' => 'ssl_error'], 400);
        }

        $request->validate([
            'key' => 'required|string|regex:/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/|size:29',
            'hwid' => 'required|string|min:5|max:200',
            'product_code' => 'required|string|max:50',
            'format' => 'sometimes|string|in:json,plain,csv'
        ]);

        // if is invalid request, return error
        if (!$request->has('key') || !$request->has('hwid') || !$request->has('product_code')) {
            return response()->json(['error' => Codes::INVALID], 400);
        }

        $productCode = $request->input('product_code');
        $format = $request->input('format', 'json');

        $license = License::with('product')
            ->where('license_key', $licenseKey)
            ->whereHas('product', function ($query) use ($productCode) {
                $query->where('product_code', $productCode);
            })
            ->first();

        if (!$license) {
            return response()->json(['error' => Codes::INVALID], 404);
        }

        $result = $this->processLicense($license, $hwid);
        
        // Determine appropriate HTTP status code based on result
        $statusCode = 200;
        if (isset($result['error'])) {
            switch ($result['error']) {
                case Codes::EXPIRED:
                case Codes::HWID_MISMATCH:
                case Codes::PAUSED:
                    $statusCode = 403; // Forbidden
                    break;
                case Codes::INVALID:
                    $statusCode = 404; // Not Found
                    break;
                default:
                    $statusCode = 400; // Bad Request
            }
        }
        
        return response()->json($result, $statusCode);
    }

    private function processLicense(License $license, string $hwid)
    {
        $now = Carbon::now();

        // check if already expired
        if ($license->status === Codes::EXPIRED) {
            return ['error' => Codes::EXPIRED];
        }

        // handle unused license (first use)
        if ($license->status === Codes::UNUSED) {
            $license->update([
                'status' => Codes::ACTIVE,
                'hwid' => $hwid,
                'activated_at' => $now,
            ]);
            return $this->buildResponse($license);
        }

        // handle active license
        if ($license->status === Codes::ACTIVE) {

            if($license->hwid === null) {
                // if hwid is null, bind it to the current hwid
                $license->update(['hwid' => $hwid]);
            }
            
            // check hwid binding
            if ($license->hwid !== $hwid) {
                return ['error' => Codes::HWID_MISMATCH];
            }

            // if not lifetime, check if expired
            if (!$license->is_lifetime) {
                $expiresAt = $license->activated_at->addSeconds($license->duration);
                if ($now->greaterThan($expiresAt)) {
                    $license->update(['status' => Codes::EXPIRED]);
                    return ['error' => Codes::EXPIRED];
                }
            }

            // check if paused
            if ($license->paused_at !== null) {
                return ['error' => Codes::PAUSED];
            }

            return $this->buildResponse($license);
        }

        Log::debug('License status is invalid', [
            'license_id' => $license->id,
            'status' => $license->status,
        ]);
        return ['error' => Codes::INVALID];
    }

    private function buildResponse(License $license)
    {
        $timeLeft = $license->is_lifetime ? 1 : $license->time_left;

        return [
            'status' => Codes::ACTIVE,
            'time_left' => $timeLeft,
            'human_time_left' => $license->time_left_human,
            'is_lifetime' => $license->is_lifetime,
            'product_name' => $license->product->name,
            'error' => null,
        ];
    }

    /* ===============================================================
                         MODEL RESOURCE METHODS
    =============================================================== */

    public function index()
    {
        $licenses = License::orderBy('id', 'desc')
            ->with('product:id,name')
            ->get();

        $products = Product::all();

        return Inertia::render('licenses', [
            'licenses' => Inertia::defer(fn() => $licenses),
            'products' => Inertia::lazy(fn() => $products),
        ]);
    }

    public function create()
    {
        try {

            $validated = request()->validate([
                'product_id' => 'required|exists:products,id',
                'duration' => 'required|integer|min:1',
                'amount' => 'required|integer|min:1|max:100',
                'description' => 'nullable|string|max:255',
                'is_lifetime' => 'boolean',
                'is_export' => 'sometimes|boolean',
            ]);

            $product = Product::find($validated['product_id']);
            if (!$product) {
                return response()->json(['error' => 'Invalid product'], 404);
            }

            $isExport = $validated['is_export'] ?? false;
            $amount = $validated['amount'] ?? 1;
            $createdLicenses = [];

            for ($i = 0; $i < $amount; $i++) {
                $createdLicenses[] = [
                    'product_id' => $product->id,
                    'license_key' => LicenseController::createLicenseKey(),
                    'duration' => $validated['duration'],
                    'status' => 'unused',
                    'hwid' => null,
                    'description' => $validated['description'] ?? null,
                    'is_lifetime' => $validated['is_lifetime'] ?? false,
                ];
            }

            License::insert($createdLicenses);

            if ($isExport) {
                // TODO: export txt file
            }

            return redirect()->back()->with('message', 'Licenses created successfully');

        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to create license - ' . $e->getMessage());
        }
    }

    public function resetHwid(License $license)
    {
        try {
            $license->update(['hwid' => null]);
            return redirect()->back()->with('message', 'HWID reset successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to reset HWID - ' . $e->getMessage());
        }
    }

    public function pause(License $license)
    {
        try {
            $license->update(['paused_at' => Carbon::now()]);
            return redirect()->back()->with('message', 'License paused successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to pause license - ' . $e->getMessage());
        }
    }

    public function unpause(License $license)
    {
        try {

            /*
                when a licence is paused, we store the time it was paused,
                and when unpaused, we calculate the time between now and paused_at (in seconds),
                then add that time to the duration.

                the abs() is used to ensure we always get a positive value,
                in case the dates are flipped.
            */
            $timeDiff = abs(Carbon::now()->diffInSeconds($license->paused_at));

            $license->update([
                'paused_at' => null,
                'duration' => $license->duration + $timeDiff,
            ]);

            return redirect()->back()->with('message', 'License unpaused successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to unpause license - ' . $e->getMessage());
        }
    }

    public function addTime(Request $request, License $license)
    {
        try {
            $validated = $request->validate([
                'seconds' => 'required|integer|min:1',
            ]);

            $seconds = $validated['seconds'];
            $license->update(['duration' => $license->duration + $seconds]);

            return redirect()->back()->with('message', 'Time added successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to add time - ' . $e->getMessage());
        }
    }

    public function update(Request $request, License $license)
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:active,expired',
            'description' => 'nullable|string|max:255'
        ]);
        $license->update($validated);
        return redirect()->back()->with('message', 'License updated successfully');
    }

    public function delete(License $license)
    {
        try {
            $license->delete();
            return redirect()->back()->with('message', 'License deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete license - ' . $e->getMessage());
        }
    }

    /* ===============================================================
                     JSON RESOURCE METHODS
    =============================================================== */

    public function apiShow(License $license)
    {
        $license = License::with('product')
            ->where('id', $license->id)
            ->first();

        if (!$license) {
            return response()->json(['error' => 'License not found'], 404);
        }

        return response()->json($license);
    }

}
