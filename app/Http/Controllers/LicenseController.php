<?php

namespace App\Http\Controllers;

use App\Enums\Codes;
use App\Models\License;
use App\Models\Product;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class LicenseController extends Controller
{

    private const RATE_LIMIT_KEY = 'license_check';
    private const RATE_LIMIT_ATTEMPTS = 5;
    private const RATE_LIMIT_DECAY = 60; // seconds
    private const CACHE_TTL = 300; // 5 minutes

    private static function createLicenseKey()
    {
        // create a random license key in the format XXXX-XXXX-XXXX-XXXX
        $key = strtoupper(bin2hex(random_bytes(8)));
        return substr($key, 0, 4) . '-' . substr($key, 4, 4) . '-' . substr($key, 8, 4) . '-' . substr($key, 12, 4);
    }

    public function check(Request $request)
    {

        // rate limiting to prevent abuse
        $rateLimitKey = self::RATE_LIMIT_KEY . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, self::RATE_LIMIT_ATTEMPTS)) {
            return response()->json(['error' => 'too_many_requests'], 429);
        }
        RateLimiter::hit($rateLimitKey, self::RATE_LIMIT_DECAY);

        // ssl check
        if (!$request->secure() && !app()->environment('local')) {
            return response()->json(['error' => 'ssl_error'], 400);
        }

        $request->validate([
            'key' => 'required|string|min:5|max:100',
            'hwid' => 'required|string|min:5|max:200',
            'product_code' => 'required|string|max:50',
            'format' => 'nullable|string|in:json,plain,csv'
        ]);

        // if is invalid request, return error
        if (!$request->has('key') || !$request->has('hwid') || !$request->has('product_code')) {
            return response()->json(['error' => Codes::INVALID], 400);
        }

        $licenseKey = $request->input('key');
        $hwid = $request->input('hwid');
        // $hwid = hash('sha256', $request->input('hwid')); // Hash HWID for privacy
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
        return response()->json($result, 200);

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
            return response()->buildResponse($license, 'activated');
        }

        // handle active license
        if ($license->status === Codes::ACTIVE) {

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

            return $this->buildResponse($license, Codes::ACTIVE);
        }

        return ['error' => Codes::INVALID];
    }

    private function buildResponse(License $license, string $status)
    {
        $timeLeft = $license->is_lifetime ? 1 : $license->time_left;
        $humanTimeLeft = Carbon::now()->addSeconds($timeLeft)->diffForHumans();

        return [
            'status' => $status,
            'time_left' => $timeLeft,
            'human_time_left' => $humanTimeLeft,
            'is_lifetime' => $license->is_lifetime,
            'product_name' => $license->product->name,
        ];
    }

    /* ===============================================================
                         MODEL RESOURCE METHODS
    =============================================================== */


    public function index()
    {
        $licenses = License::select('id', 'product_id', 'license_key', 'duration', 'status', 'description', 'is_lifetime', 'created_at')
            ->orderBy('id', 'desc')
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

    public function update(License $license)
    {
        // Logic to update an existing license
    }

    public function delete(License $license)
    {
        // Logic to delete a license
    }

}
