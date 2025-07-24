<?php

use App\Http\Controllers\LicenseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::group(['prefix' => 'license','middleware' => [
        'throttle:license-check',  // Custom rate limiting
        'secure-headers',          // Security headers middleware
        'api-auth'                 // API authentication middleware
    ]
], function () {

    // Main license check endpoint
    Route::post('/check', [LicenseController::class, 'check'])->name('api.license.check');

    // // Health check endpoint (for monitoring)
    // Route::get('/health', function () {
    //     return response()->json([
    //         'status' => 'online',
    //         'timestamp' => time(),
    //         'server_id' => config('app.server_id', 'main')
    //     ]);
    // })->name('api.license.health');
});

// Fallback route for invalid endpoints
Route::fallback(function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Endpoint not found'
    ], 404);
});