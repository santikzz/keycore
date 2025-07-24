<?php

namespace App\Http\Controllers;

use App\Models\File;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FileController extends Controller
{

    public function index()
    {
        $files = File::with('product:id,name')
        ->orderBy("created_at", "desc")->get();

        return Inertia::render('files', [
            'files' => $files,
        ]);
    }

    public function upload()
    {
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
            'custom_name' => 'nullable|string|max:255',
            'is_hidden' => 'nullable|boolean',
            'is_downloadable' => 'nullable|boolean',
            'file' => 'required|file'
        ]);

        try {

            // store file in private storage
            $filePath = request()->file('file')->store('files');

            $file = File::create([
                'product_id' => $validated['product_id'],
                'custom_name' => $validated['custom_name'] ?? null,
                'file_name' => request()->file('file')->getClientOriginalName(),
                'file_path' => $filePath,
                'is_hidden' => $validated['is_hidden'] ?? false,
                'is_downloadable' => $validated['is_downloadable'] ?? true,
            ]);

            return redirect()->route('files.index')->with('success', 'File uploaded successfully.');

        } catch (Exception $e) {
            Log::error('File upload failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'File upload failed. Please try again.');
        }

    }

    public function update(File $file){
        
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
            'custom_name' => 'nullable|string|max:255',
            'is_hidden' => 'nullable|boolean',
            'is_downloadable' => 'nullable|boolean'
        ]);

        try {

            $file->update([
                'product_id' => $validated['product_id'],
                'custom_name' => $validated['custom_name'] ?? null,
                'is_hidden' => $validated['is_hidden'] ?? false,
                'is_downloadable' => $validated['is_downloadable'] ?? true,
            ]);

            return redirect()->route('files.index')->with('success', 'File updated successfully.');

        } catch (Exception $e) {
            Log::error('File update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'File update failed. Please try again.');
        }
            
    }

    public function delete(File $file){
        $file->delete();
        return redirect()->route('files.index')->with('success', 'File deleted successfully.');
    }

}
