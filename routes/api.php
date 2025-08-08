<?php

use App\Http\Controllers\LicenseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/v1/license/check', [LicenseController::class, 'check'])
    ->middleware(['throttle:60,1']) // 60 requests per minute
    ->name('api.license.check');

// Fallback route for invalid endpoints
Route::fallback(function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Endpoint not found'
    ], 404);
});