<?php

// app/Http/Middleware/SecureHeaders.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecureHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Content-Security-Policy', "default-src 'none'");
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}

// app/Http/Middleware/ApiAuth.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApiAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Additional API authentication checks
        $allowedMethods = ['POST'];
        if (!in_array($request->method(), $allowedMethods)) {
            return response()->json(['status' => 'error', 'message' => 'Method not allowed'], 405);
        }

        // Check for required headers
        $requiredHeaders = ['User-Agent', 'Content-Type'];
        foreach ($requiredHeaders as $header) {
            if (!$request->hasHeader($header)) {
                Log::warning('Missing required header: ' . $header, ['ip' => $request->ip()]);
                return response()->json(['status' => 'error', 'message' => 'Bad request'], 400);
            }
        }

        // Validate Content-Type
        if (!str_contains($request->header('Content-Type'), 'application/json')) {
            return response()->json(['status' => 'error', 'message' => 'Invalid content type'], 400);
        }

        return $next($request);
    }
}

// Add to app/Http/Kernel.php in $middlewareAliases array:
/*
'secure-headers' => \App\Http\Middleware\SecureHeaders::class,
'api-auth' => \App\Http\Middleware\ApiAuth::class,
*/

// Add custom rate limiter in app/Providers/RouteServiceProvider.php boot() method:
/*
RateLimiter::for('license-check', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip())
                ->response(function () {
                    return response()->json(['status' => 'error', 'message' => 'Too many requests'], 429);
                });
});
*/