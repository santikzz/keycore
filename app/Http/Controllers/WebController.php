<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\License;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WebController extends Controller
{

    public function download()
    {
        return Inertia::render('download');
    }

    public function downloadSearch(Request $request)
    {
        $validated = $request->validate([
            'license_key' => 'required|string|max:255',
        ]);

        $licenseKey = $validated['license_key'];

        try {
            // First, verify the license is valid and active
            $license = \App\Models\License::where('license_key', $licenseKey)->first();
            if (!$license || $license->c_status !== \App\Enums\Codes::ACTIVE) {
                return response()->json([
                    'files' => [],
                    'count' => 0,
                    'error' => 'Invalid or inactive license.'
                ], 403);
            }

            // Find files where is_downloadable is true and is_hidden is false
            // Only for licenses that match the provided key and are active
            $files = File::where('is_downloadable', true)
                ->where('is_hidden', false)
                ->whereHas('product.licenses', function ($query) use ($licenseKey) {
                    $query->where('license_key', $licenseKey)
                          ->where('status', \App\Enums\Codes::ACTIVE);
                })
                ->select(['id', 'custom_name', 'file_name', 'product_id', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Log the search for audit purposes
            Log::info('File search performed', [
                'license_key' => $licenseKey,
                'files_found' => $files->count(),
                'user_ip' => $request->ip(),
            ]);

            return response()->json([
                'files' => $files,
                'count' => $files->count()
            ]);

        } catch (Exception $e) {
            Log::error('Error searching files: ' . $e->getMessage(), [
                'license_key' => $licenseKey,
                'user_ip' => $request->ip(),
                'stack_trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Error searching files.'], 500);
        }
    }

    public function downloadFile(Request $request)
    {
        $validated = $request->validate([
            'file_id' => 'required|integer|exists:files,id',
            'license_key' => 'required|string|max:255',
        ]);

        try {
            $licenseKey = $validated['license_key'];
            $fileId = $validated['file_id'];

            // First, verify the license is valid and active
            $license = License::where('license_key', $licenseKey)->first();
            if (!$license || $license->c_status !== \App\Enums\Codes::ACTIVE) {
                return response()->json(['error' => 'Invalid or inactive license.'], 403);
            }

            $file = File::where('is_downloadable', true)
                ->where('is_hidden', false)
                ->whereHas('product.licenses', function ($query) use ($licenseKey) {
                    $query->where('license_key', $licenseKey)
                          ->where('status', \App\Enums\Codes::ACTIVE);
                })
                ->where('id', $fileId)
                ->first();

            if (!$file) {
                return response()->json(['error' => 'File not found'], 404);
            }

            if (!Storage::disk('local')->exists($file->file_path)) {
                Log::warning('File not found on disk', [
                    'file_id' => $fileId,
                    'file_path' => $file->file_path,
                    'license_key' => $licenseKey,
                ]);
                return response()->json(['error' => 'File not found on server.'], 404);
            }

            // Get the file path directly instead of copying to temp
            $filePath = Storage::disk('local')->path($file->file_path);
            
            // Security check: ensure the file path is within the storage directory
            $storagePath = Storage::disk('local')->path('');
            if (!str_starts_with(realpath($filePath), realpath($storagePath))) {
                Log::error('Potential path traversal attempt', [
                    'file_id' => $fileId,
                    'file_path' => $file->file_path,
                    'resolved_path' => $filePath,
                    'license_key' => $licenseKey,
                    'user_ip' => $request->ip(),
                ]);
                return response()->json(['error' => 'Access denied.'], 403);
            }
            
            // Check if file exists on disk
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'File not accessible.'], 404);
            }

            // Log the download for audit purposes
            // Log::info('File downloaded', [
            //     'file_id' => $fileId,
            //     'file_name' => $file->file_name,
            //     'license_key' => $licenseKey,
            //     'user_ip' => $request->ip(),
            // ]);

            return response()->download($filePath, $file->file_name);

        } catch (Exception $e) {
            // Log::error('Error downloading file: ' . $e->getMessage(), [
            //     'file_id' => $fileId ?? null,
            //     'license_key' => $licenseKey ?? null,
            //     'user_ip' => $request->ip(),
            //     'stack_trace' => $e->getTraceAsString(),
            // ]);
            return response()->json(['error' => 'Error downloading file.'], 500);
        }
    }

}
