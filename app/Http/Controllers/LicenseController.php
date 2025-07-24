<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\Product;
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

        $rateLimitKey = self::RATE_LIMIT_KEY . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, self::RATE_LIMIT_ATTEMPTS)) {
            return response()->json(['error' => 'Too many requests'], 429);
        }

        RateLimiter::hit($rateLimitKey, self::RATE_LIMIT_DECAY);

        try {

            // Validate request
            $validated = $this->validateRequest($request);
            if ($validated !== true) {
                return $validated;
            }

            // Security checks
            $securityCheck = $this->performSecurityChecks($request);
            if ($securityCheck !== true) {
                return $securityCheck;
            }

            $licenseKey = $request->input('key');
            $hwid = $request->input('hwid');
            $productCode = $request->input('product_code');
            $format = strtolower($request->input('format', 'json'));
            $hashedHwid = hash('sha256', $hwid);

            $license = $this->findLicenseWithProduct($licenseKey, $productCode);
            if (!$license) {
                return $this->formatResponse([
                    'status' => 'invalid',
                    'message' => 'License key not found or invalid product'
                ], $format, 404);
            }

            // Process license
            $result = $this->processLicense($license, $hashedHwid);

            // Add security signature
            $result = $this->addSecuritySignature($result, $request);

            // Log successful check
            Log::info('License check successful', [
                'license_id' => $license->id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return $this->formatResponse($result, $format);

        } catch (Exception $e) {
            Log::error('License check error: ' . $e->getMessage(), [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return $this->securityResponse('internal_error', 500);
        }

    }

    private function validateRequest(Request $request)
    {
        $validator = validator($request->all(), [
            'key' => 'required|string|min:10|max:100',
            'hwid' => 'required|string|min:10|max:200',
            'product_code' => 'required|string|max:50',
            'format' => 'nullable|string|in:json,plain,csv',
            'timestamp' => 'required|integer',
            'nonce' => 'required|string|min:16|max:32',
            'signature' => 'required|string'
        ]);

        if ($validator->fails()) {
            return $this->securityResponse('invalid_request', 400);
        }

        return true;
    }

    /**
     * Perform comprehensive security checks
     */
    private function performSecurityChecks(Request $request)
    {
        // Check timestamp (prevent replay attacks)
        $timestamp = $request->input('timestamp');
        $currentTime = time();
        if (abs($currentTime - $timestamp) > 300) { // 5 minutes tolerance
            return $this->securityResponse('timestamp_invalid', 401);
        }

        // Check nonce (prevent replay attacks)
        $nonce = $request->input('nonce');
        $nonceKey = 'nonce:' . $nonce;
        if (Cache::has($nonceKey)) {
            return $this->securityResponse('nonce_reused', 401);
        }
        Cache::put($nonceKey, true, 600); // Store for 10 minutes

        // Verify request signature
        if (!$this->verifyRequestSignature($request)) {
            return $this->securityResponse('signature_invalid', 401);
        }

        // Check for suspicious patterns
        if ($this->detectSuspiciousActivity($request)) {
            return $this->securityResponse('suspicious_activity', 403);
        }

        // SSL/TLS verification (ensure HTTPS)
        if (!$request->secure() && !app()->environment('local')) {
            return $this->securityResponse('ssl_required', 400);
        }

        // Check User-Agent patterns
        $userAgent = $request->userAgent();
        if ($this->isSuspiciousUserAgent($userAgent)) {
            return $this->securityResponse('invalid_client', 403);
        }

        return true;
    }

    /**
     * Verify request signature for integrity
     */
    private function verifyRequestSignature(Request $request)
    {
        $signature = $request->input('signature');
        $timestamp = $request->input('timestamp');
        $nonce = $request->input('nonce');
        $key = $request->input('key');
        $hwid = $request->input('hwid');
        $productCode = $request->input('product_code');

        // Create payload for signature verification
        $payload = $key . $hwid . $productCode . $timestamp . $nonce;
        $expectedSignature = hash_hmac('sha256', $payload, config('app.key'));

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Detect suspicious activity patterns
     */
    private function detectSuspiciousActivity(Request $request)
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        // Check for rapid requests from same IP
        $rapidRequestKey = 'rapid_requests:' . $ip;
        $requestCount = Cache::get($rapidRequestKey, 0);
        if ($requestCount > 20) { // More than 20 requests per minute
            return true;
        }
        Cache::put($rapidRequestKey, $requestCount + 1, 60);

        // Check for multiple different HWIDs from same IP
        $hwidKey = 'hwid_count:' . $ip;
        $hwid = $request->input('hwid');
        $hwids = Cache::get($hwidKey, []);
        if (!in_array($hwid, $hwids)) {
            $hwids[] = $hwid;
            if (count($hwids) > 5) { // More than 5 different HWIDs per hour
                return true;
            }
            Cache::put($hwidKey, $hwids, 3600);
        }

        return false;
    }

    /**
     * Check for suspicious User-Agent patterns
     */
    private function isSuspiciousUserAgent($userAgent)
    {
        $suspiciousPatterns = [
            'burp',
            'proxy',
            'crawler',
            'bot',
            'scanner',
            'hack',
            'test',
            'postman',
            'curl',
            'wget',
            'python-requests'
        ];

        $userAgentLower = strtolower($userAgent);
        foreach ($suspiciousPatterns as $pattern) {
            if (strpos($userAgentLower, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find license with product validation
     */
    private function findLicenseWithProduct($licenseKey, $productCode)
    {
        $cacheKey = 'license:' . md5($licenseKey . $productCode);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($licenseKey, $productCode) {
            return License::with('product')
                ->where('license_key', $licenseKey)
                ->whereHas('product', function ($query) use ($productCode) {
                    $query->where('product_code', $productCode);
                })
                ->first();
        });
    }

    /**
     * Process license and update status
     */
    private function processLicense(License $license, $hashedHwid)
    {
        $now = Carbon::now();

        // Check if license is already expired
        if ($license->status === 'expired') {
            return [
                'status' => 'expired',
                'message' => 'License has expired',
                'time_left' => 0,
                'is_lifetime' => $license->is_lifetime
            ];
        }

        // Handle unused license (first activation)
        if ($license->status === 'unused') {
            $license->update([
                'status' => 'active',
                'activated_at' => $now,
                'hwid' => $hashedHwid
            ]);

            return $this->buildLicenseResponse($license, 'activated');
        }

        // Handle active license
        if ($license->status === 'active') {
            // Check HWID binding
            if ($license->hwid !== $hashedHwid) {
                return [
                    'status' => 'hwid_mismatch',
                    'message' => 'License bound to different hardware',
                    'time_left' => 0,
                    'is_lifetime' => false
                ];
            }

            // Check if license has expired (non-lifetime)
            if (!$license->is_lifetime) {
                $expiresAt = $license->activated_at->addSeconds($license->duration);
                if ($now->greaterThan($expiresAt)) {
                    $license->update(['status' => 'expired']);
                    return [
                        'status' => 'expired',
                        'message' => 'License has expired',
                        'time_left' => 0,
                        'is_lifetime' => false
                    ];
                }
            }

            return $this->buildLicenseResponse($license, 'valid');
        }

        return [
            'status' => 'invalid',
            'message' => 'License status not recognized',
            'time_left' => 0,
            'is_lifetime' => false
        ];
    }

    /**
     * Build license response data
     */
    private function buildLicenseResponse(License $license, $status)
    {
        $timeLeft = $license->is_lifetime ? 1 : $license->time_left;

        return [
            'status' => $status,
            'message' => $status === 'activated' ? 'License activated successfully' : 'License is valid',
            'time_left' => $timeLeft,
            'is_lifetime' => $license->is_lifetime,
            'activated_at' => $license->activated_at?->toISOString(),
            'product_name' => $license->product->name,
            'description' => $license->description
        ];
    }

    /**
     * Add security signature to response
     */
    private function addSecuritySignature(array $data, Request $request)
    {
        $timestamp = time();
        $nonce = bin2hex(random_bytes(16));

        // Create signature payload
        $payload = json_encode($data) . $timestamp . $nonce;
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        $data['_security'] = [
            'timestamp' => $timestamp,
            'nonce' => $nonce,
            'signature' => $signature,
            'server_id' => config('app.server_id', 'main')
        ];

        return $data;
    }

    /**
     * Format response based on requested format
     */
    private function formatResponse(array $data, string $format = 'json', int $statusCode = 200)
    {
        switch ($format) {
            case 'plain':
                $content = $this->formatPlainResponse($data);
                return response($content, $statusCode)
                    ->header('Content-Type', 'text/plain');

            case 'csv':
                $content = $this->formatCsvResponse($data);
                return response($content, $statusCode)
                    ->header('Content-Type', 'text/csv');

            case 'json':
            default:
                return response()->json($data, $statusCode)
                    ->header('X-Content-Type-Options', 'nosniff')
                    ->header('X-Frame-Options', 'DENY');
        }
    }

    /**
     * Format plain text response
     */
    private function formatPlainResponse(array $data)
    {
        $lines = [];
        foreach ($data as $key => $value) {
            if ($key === '_security')
                continue;
            if (is_array($value)) {
                $value = json_encode($value);
            }
            $lines[] = $key . '=' . $value;
        }
        return implode("\n", $lines);
    }

    /**
     * Format CSV response
     */
    private function formatCsvResponse(array $data)
    {
        $filtered = array_filter($data, function ($key) {
            return $key !== '_security';
        }, ARRAY_FILTER_USE_KEY);

        $headers = array_keys($filtered);
        $values = array_values($filtered);

        $csv = implode(',', $headers) . "\n";
        $csv .= implode(',', array_map(function ($value) {
            return is_array($value) ? json_encode($value) : $value;
        }, $values));

        return $csv;
    }

    /**
     * Return security-focused error response
     */
    private function securityResponse(string $error, int $code)
    {
        // Log security event
        Log::warning('Security event: ' . $error, [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()
        ]);

        // Generic error messages to prevent information leakage
        $genericMessages = [
            'rate_limit_exceeded' => 'Too many requests',
            'timestamp_invalid' => 'Request expired',
            'nonce_reused' => 'Invalid request',
            'signature_invalid' => 'Authentication failed',
            'suspicious_activity' => 'Access denied',
            'ssl_required' => 'Secure connection required',
            'invalid_client' => 'Invalid client',
            'invalid_request' => 'Bad request',
            'internal_error' => 'Service temporarily unavailable'
        ];

        return response()->json([
            'status' => 'error',
            'message' => $genericMessages[$error] ?? 'Access denied'
        ], $code);
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
