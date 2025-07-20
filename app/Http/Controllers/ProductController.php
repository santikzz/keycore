<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{

    public function index()
    {
        $products = Product::withCount('licenses as license_count')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('products', [
            'products' => Inertia::defer(fn() => $products),
        ]);
    }

    public function create()
    {
        try {
            $validated = request()->validate([
                'product_name' => 'required|string|max:255',
                'product_code' => 'required|string|max:255|unique:products,product_code',
            ]);

            $product = Product::create([
                'name' => $validated['product_name'],
                'product_code' => $validated['product_code'],
            ]);

            return redirect()->back()->with('success', 'Product created successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    public function update(Product $product)
    {
        try {
            $validated = request()->validate([
                'product_name' => 'required|string|max:255',
                'product_code' => 'required|string|max:255'
            ]);

            $product->update([
                'name' => $validated['product_name'],
                'product_code' => $validated['product_code'],
            ]);

            return redirect()->back()->with('success', 'Product updated successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update product: ' . $e->getMessage());
        }
    }

    public function delete(Product $product)
    {
        try {
            $product->delete();
            return redirect()->back()->with('success', 'Product deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete product: ' . $e->getMessage());
        }
    }

    /*
        ========= JSON API METHODS =========
    */

    public function apiIndex(Request $request)
    {
        $products = Product::select('id', 'name', 'product_code', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($products);
    }

}
