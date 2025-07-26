<?php

use App\Enums\Codes;
use App\Models\License;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->product = Product::create([
        'name' => 'Test Product',
        'product_code' => 'TEST_PRODUCT',
        'description' => 'Test product for unit testing',
    ]);
});

describe('License Model Attributes', function () {
    
    it('calculates time_left correctly for active license', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600, // 1 hour
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subMinutes(30), // 30 minutes ago
        ]);

        // Should have about 30 minutes (1800 seconds) left
        expect($license->time_left)->toBeGreaterThan(1700);
        expect($license->time_left)->toBeLessThan(1900);
    });

    it('returns 0 time_left for expired license', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600, // 1 hour
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subHours(2), // 2 hours ago
        ]);

        expect($license->time_left)->toBe(0);
    });

    it('returns full duration for unused license', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::UNUSED,
            'activated_at' => null,
        ]);

        expect($license->time_left)->toBe(3600);
    });

    it('returns high value for lifetime license', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'is_lifetime' => true,
            'activated_at' => Carbon::now()->subYears(5),
        ]);

        expect($license->time_left)->toBe(PHP_INT_MAX);
    });

    it('calculates duration_human correctly', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600, // 1 hour
            'status' => Codes::UNUSED,
        ]);

        expect($license->duration_human)->toContain('1h');
    });

    it('shows lifetime for lifetime licenses', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::UNUSED,
            'is_lifetime' => true,
        ]);

        expect($license->duration_human)->toBe('Lifetime');
        expect($license->time_left_human)->toBe('Lifetime');
    });

    it('detects expired license correctly', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subHours(2), // Expired
        ]);

        expect($license->is_expired)->toBeTrue();
    });

    it('detects non-expired license correctly', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subMinutes(30), // Still active
        ]);

        expect($license->is_expired)->toBeFalse();
    });

    it('lifetime license is never expired', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'is_lifetime' => true,
            'activated_at' => Carbon::now()->subYears(10),
        ]);

        expect($license->is_expired)->toBeFalse();
    });
});

describe('License Computed Status (c_status)', function () {
    
    it('returns paused when paused_at is set', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subMinutes(10),
            'paused_at' => Carbon::now()->subMinutes(5),
        ]);

        expect($license->c_status)->toBe(Codes::PAUSED);
    });

    it('returns expired when time has run out even if status is still active', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE, // Status not updated yet
            'activated_at' => Carbon::now()->subHours(2), // But time has expired
        ]);

        expect($license->c_status)->toBe(Codes::EXPIRED);
    });

    it('returns original status when not paused or expired', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subMinutes(10),
            'paused_at' => null,
        ]);

        expect($license->c_status)->toBe(Codes::ACTIVE);
    });

    it('returns unused for unused licenses', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::UNUSED,
        ]);

        expect($license->c_status)->toBe(Codes::UNUSED);
    });

    it('prioritizes paused over expired', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now()->subHours(2), // Expired
            'paused_at' => Carbon::now()->subMinutes(5), // But also paused
        ]);

        // Should return paused since it's checked first
        expect($license->c_status)->toBe(Codes::PAUSED);
    });

    it('handles lifetime licenses correctly in c_status', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::ACTIVE,
            'is_lifetime' => true,
            'activated_at' => Carbon::now()->subYears(10), // Very old
        ]);

        expect($license->c_status)->toBe(Codes::ACTIVE);
    });
});

describe('License Model Edge Cases', function () {
    
    it('handles null activated_at gracefully', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::UNUSED,
            'activated_at' => null,
        ]);

        expect($license->is_expired)->toBeFalse();
        expect($license->c_status)->toBe(Codes::UNUSED);
        expect($license->time_left)->toBe(3600);
    });

    it('handles zero duration correctly', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 0,
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now(),
        ]);

        // Zero duration should immediately expire (unless lifetime)
        expect($license->is_expired)->toBeTrue();
        expect($license->c_status)->toBe(Codes::EXPIRED);
    });

    it('handles very large duration values', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 999999999, // Very large duration
            'status' => Codes::ACTIVE,
            'activated_at' => Carbon::now(),
        ]);

        expect($license->is_expired)->toBeFalse();
        expect($license->c_status)->toBe(Codes::ACTIVE);
        expect($license->time_left)->toBeGreaterThan(999999990);
    });

    it('handles database status already expired', function () {
        $license = License::create([
            'product_id' => $this->product->id,
            'license_key' => 'TEST-KEY-123',
            'duration' => 3600,
            'status' => Codes::EXPIRED, // Already marked as expired
            'activated_at' => Carbon::now()->subMinutes(10),
        ]);

        expect($license->is_expired)->toBeTrue();
        expect($license->c_status)->toBe(Codes::EXPIRED);
    });
});
