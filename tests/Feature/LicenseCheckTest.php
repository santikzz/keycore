<?php

use App\Enums\Codes;
use App\Models\License;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create a test product
    $this->product = Product::create([
        'name' => 'Test Product',
        'product_code' => 'TEST_PRODUCT',
        'description' => 'Test product for license testing',
    ]);
    
    // Common test data
    $this->validKey = 'TEST-1234-5678-9ABC-DEF0-1234';
    $this->validHwid = 'test-hardware-id-12345';
    $this->validProductCode = 'TEST_PRODUCT';
});

describe('License Check API', function () {
    
    it('returns error for invalid license key', function () {
        $response = $this->postJson('/api/license/check', [
            'key' => 'INVALID-KEY',
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::INVALID]);
    });

    it('returns error for invalid product code', function () {
        License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::UNUSED,
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => 'INVALID_PRODUCT',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::INVALID]);
    });

    it('activates unused license on first use', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600, // 1 hour
            'status' => Codes::UNUSED,
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => Codes::ACTIVE,
                     'is_lifetime' => false,
                     'product_name' => 'Test Product',
                     'error' => null,
                 ]);

        // Verify license was updated in database
        $license->refresh();
        expect($license->status)->toBe(Codes::ACTIVE);
        expect($license->hwid)->toBe($this->validHwid);
        expect($license->activated_at)->not->toBeNull();
    });

    it('returns active status for valid active license', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'hwid' => $this->validHwid,
            'activated_at' => Carbon::now()->subMinutes(10),
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => Codes::ACTIVE,
                     'error' => null,
                 ]);
    });

    it('returns error for HWID mismatch', function () {
        License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'hwid' => 'different-hwid',
            'activated_at' => Carbon::now()->subMinutes(10),
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::HWID_MISMATCH]);
    });

    it('returns error for expired license', function () {
        License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::EXPIRED,
            'hwid' => $this->validHwid,
            'activated_at' => Carbon::now()->subHours(2),
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::EXPIRED]);
    });

    it('auto-expires license when time runs out', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600, // 1 hour
            'status' => Codes::ACTIVE,
            'hwid' => $this->validHwid,
            'activated_at' => Carbon::now()->subHours(2), // activated 2 hours ago
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::EXPIRED]);

        // Verify license was updated to expired in database
        $license->refresh();
        expect($license->status)->toBe(Codes::EXPIRED);
    });

    it('returns error for paused license', function () {
        License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'hwid' => $this->validHwid,
            'activated_at' => Carbon::now()->subMinutes(10),
            'paused_at' => Carbon::now()->subMinutes(5),
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['error' => Codes::PAUSED]);
    });

    it('handles lifetime license correctly', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 0, // Not used for lifetime
            'status' => Codes::ACTIVE,
            'hwid' => $this->validHwid,
            'is_lifetime' => true,
            'activated_at' => Carbon::now()->subYears(10), // Very old activation
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => Codes::ACTIVE,
                     'is_lifetime' => true,
                     'error' => null,
                 ]);
    });

    it('binds HWID when license has null HWID', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => $this->validKey,
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'hwid' => null, // No HWID bound yet
            'activated_at' => Carbon::now()->subMinutes(10),
        ]);

        $response = $this->postJson('/api/license/check', [
            'key' => $this->validKey,
            'hwid' => $this->validHwid,
            'product_code' => $this->validProductCode,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => Codes::ACTIVE,
                     'error' => null,
                 ]);

        // Verify HWID was bound
        $license->refresh();
        expect($license->hwid)->toBe($this->validHwid);
    });

    it('enforces rate limiting', function () {
        // Make multiple requests quickly to trigger rate limiting
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/license/check', [
                'key' => 'some-key',
                'hwid' => 'some-hwid',
                'product_code' => 'some-code',
            ]);
        }

        // The last request should be rate limited
        expect($response->status())->toBe(429);
        $response->assertJson(['error' => 'too_many_requests']);
    });

    it('validates required fields', function () {
        $response = $this->postJson('/api/license/check', [
            // Missing required fields
        ]);

        $response->assertStatus(422); // Validation error
    });

    it('validates field formats', function () {
        $response = $this->postJson('/api/license/check', [
            'key' => 'x', // Too short
            'hwid' => 'y', // Too short
            'product_code' => str_repeat('a', 60), // Too long
        ]);

        $response->assertStatus(422); // Validation error
    });
});
