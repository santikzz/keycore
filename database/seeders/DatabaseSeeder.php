<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Santikz',
            'email' => 'admin@admin.com',
            'password' => Hash::make('123123'),
        ]);

        Product::create([
            'name' => 'Core Pixelbot v3',
            'product_code' => 'core-pixelbot-v3'
        ]);

        Product::create([
            'name' => 'Shodan AI Premium',
            'product_code' => 'shodan-ai-premium'
        ]);

    }
}
