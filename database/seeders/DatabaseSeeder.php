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

        // User::factory()->create([
        //     'name' => 'Santikz',
        //     'email' => 'admin@admin.com',
        //     'password' => Hash::make('123123'),
        // ]);

        User::create([
            'name' => 'zapcrash',
            'email' => 'zapcrash@nimrodcore.net',
            'password' => '$2y$12$zHMZNrhtgsqmtuHIqJDCaO7OnMfAOR5l1X5Pi1xi7ki4KqUZt2FMG',
            'email_verified_at' => now(),
            'is_super' => true,
        ]);

        User::create([
            'name' => 'kiroshi',
            'email' => 'kiroshi@nimrodcore.net',
            'password' => '$2y$12$/H8mek/Dp4cTydFgF/s3wOlW11i7fGguJNT4ULL2hYqfia1RF1W3e',
            'email_verified_at' => now(),
            'is_super' => true,
        ]);

        User::create([
            'name' => 'helz',
            'email' => 'helz@nimrodcore.net',
            'password' => '$2y$12$Yf1lyIeJCEWPc4JoUfHMM.nN1Cktmc/d/UqxSRzKCwaI13Ef2Gldm',
            'email_verified_at' => now(),
        ]);

        Product::create([
            'name' => 'Core Pixelbot v3 Test',
            'product_code' => 'core-pixelbot-v3-test'
        ]);

        Product::create([
            'name' => 'Shodan AI Premium Test',
            'product_code' => 'shodan-ai-premium-test'
        ]);

    }
}
