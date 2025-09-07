<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WebController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WebController::class, 'landing'])->name('home');

Route::get('download', [WebController::class, 'download'])->name('download');
Route::post('download/search', [WebController::class, 'downloadSearch'])->name('download.search');
Route::post('download/file', [WebController::class, 'downloadFile'])->name('download.file');

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
    //
    Route::post('licenses/{license}/reset', [LicenseController::class, 'resetHwid'])->name('licenses.reset-hwid');
    Route::post('licenses/{license}/pause', [LicenseController::class, 'pause'])->name('licenses.pause');
    Route::post('licenses/{license}/unpause', [LicenseController::class, 'unpause'])->name('licenses.unpause');
    Route::post('licenses/{license}/addtime', [LicenseController::class, 'addTime'])->name('licenses.add-time');

    Route::get('files', [FileController::class, 'index'])->name('files.index');
    Route::post('files', [FileController::class, 'upload'])->name('files.upload');
    Route::put('files/{file}', [FileController::class, 'update'])->name('files.update');
    Route::delete('files/{file}', [FileController::class, 'delete'])->name('files.delete');

    /*
        ================== JSON API ROUTES ==================
    */
    Route::get('api/products', [ProductController::class, 'apiIndex'])->name('api.products.index');
    Route::get('api/licenses/{license}', [LicenseController::class, 'apiShow'])->name('api.licenses.show');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
