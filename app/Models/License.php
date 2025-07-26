<?php

namespace App\Models;

use App\Enums\Codes;
use Carbon\Carbon;
use Carbon\CarbonInterval;
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
        'duration_human',
        'time_left',
        'time_left_human',
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

    public function getDurationHumanAttribute()
    {
        if ($this->is_lifetime) {
            return 'Lifetime';
        }
        return CarbonInterval::seconds($this->duration)->cascade()->forHumans(['short' => true]);
    }

    public function getTimeLeftAttribute()
    {
        $diff = floor(abs(Carbon::now()->diffInSeconds($this->activated_at)));
        return $diff > 0 ? $diff : 0;
    }

    public function getTimeLeftHumanAttribute()
    {
        if ($this->time_left <= 0) {
            return '0 seconds';
        }
        return CarbonInterval::seconds($this->time_left)
            ->cascade()
            ->forHumans(['short' => true]);
    }

    public function getIsExpiredAttribute()
    {
        return $this->status === Codes::EXPIRED || ($this->activated_at && Carbon::now()->greaterThan($this->activated_at->addSeconds($this->duration)));
    }

    /*
        ============= MODEL SCOPES =============
    */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

}
