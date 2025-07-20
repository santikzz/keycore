<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LicenseController extends Controller
{

    protected static function createLicenseKey()
    {   
        // create a random license key in the format XXXX-XXXX-XXXX-XXXX
        $key = strtoupper(bin2hex(random_bytes(8)));
        return substr($key, 0, 4) . '-' . substr($key, 4, 4) . '-' . substr($key, 8, 4) . '-' . substr($key, 12, 4);
    }

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
