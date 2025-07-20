<?php

use App\Http\Controllers\LicenseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::post('products', [ProductController::class, 'create'])->name('products.create');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('products/{product}', [ProductController::class, 'delete'])->name('products.delete');

    Route::get('licenses', [LicenseController::class, 'index'])->name('licenses.index');
    Route::post('licenses', [LicenseController::class, 'create'])->name('licenses.create');
    Route::put('licenses/{license}', [LicenseController::class, 'update'])->name('licenses.update');
    Route::delete('licenses/{license}', [LicenseController::class, 'delete'])->name('licenses.delete');

    /*
        ================== JSON API ROUTES ==================
    */
    Route::get('api/products', [ProductController::class, 'apiIndex'])->name('api.products.index');


});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
