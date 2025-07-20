<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    protected $fillable = [
        'product_id',
        'license_key',
        'duration',
        'status',
        'hwid',
        'description',
        'is_lifetime',
        'activated_at',
        'paused_at',
    ];

    protected $casts = [
        'is_lifetime' => 'boolean',
        'activated_at' => 'datetime',
        'paused_at' => 'datetime',
    ];

    protected $appends = [
        'time_left',
        'is_expired',
    ];

    /*
        ============= MODEL RELATIONS =============
    */

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function registries()
    {
        return $this->hasMany(Registry::class);
    }

    /*
        ============= MODEL ATTRIBUTES =============
    */

    public function getTimeLeftAttribute()
    {
        if ($this->activated_at === null || $this->isExpired()) {
            return 0;
        }

        if ($this->is_lifetime) {
            return 1;
        }

        $expiresAt = $this->activated_at->addSeconds($this->duration);
        $remainingSeconds = $expiresAt->diffInSeconds(now());

        return $remainingSeconds > 0 ? $remainingSeconds : 0;
    }

    public function getIsExpiredAttribute()
    {
        return $this->status === 'expired';
    }

    /*
        ============= MODEL SCOPES =============
    */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

}
