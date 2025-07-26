<?php

namespace App\Models;

use App\Enums\Codes;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

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

    // protected $dates = [
    //     'activated_at',
    //     'paused_at',
    // ];

    protected $appends = [
        'duration_human',
        'time_left',
        'time_left_human',
        'is_expired',
        'c_status',
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
        // if lifetime license, return a high value
        if ($this->is_lifetime) {
            return 1;
        }
        
        // if not activated yet, return the full duration
        if (!$this->activated_at) {
            return $this->duration;
        }
        
        // calculate expiration time
        $activatedAt = Carbon::parse($this->activated_at);
        $expirationTime = $activatedAt->addSeconds($this->duration);
        
        // calculate seconds left until expiration
        $secondsLeft = floor(Carbon::now()->diffInSeconds($expirationTime, false));
        
        // return 0 if expired, otherwise return seconds left
        return max(0, $secondsLeft);
    }

    public function getTimeLeftHumanAttribute()
    {
        if ($this->is_lifetime) {
            return 'Lifetime';
        }
        
        if ($this->time_left <= 0) {
            return '0 seconds';
        }
        
        return CarbonInterval::seconds($this->time_left)
            ->cascade()
            ->forHumans(['short' => true]);
    }

    public function getIsExpiredAttribute()
    {
        if ($this->getRawOriginal('status') === Codes::EXPIRED) {
            return true;
        }
        
        if (!$this->activated_at || $this->is_lifetime) {
            return false;
        }
        
        $activatedAt = Carbon::parse($this->activated_at);
        $expirationTime = $activatedAt->addSeconds($this->duration);
        return Carbon::now()->greaterThan($expirationTime);
    }

    public function getCStatusAttribute()
    {
        // Check if paused first
        $rawPausedAt = $this->getRawOriginal('paused_at');
        if ($rawPausedAt !== null && $rawPausedAt !== '' && $rawPausedAt !== '0000-00-00') {
            return Codes::PAUSED;
        }
        
        // Check if license has expired based on time (even if DB status isn't updated)
        if ($this->activated_at && !$this->is_lifetime) {
            $activatedAt = Carbon::parse($this->activated_at);
            $expirationTime = $activatedAt->addSeconds($this->duration);
            if (Carbon::now()->greaterThan($expirationTime)) {
                return Codes::EXPIRED;
            }
        }
        
        // Return the original status (unused, active, expired)
        return $this->getRawOriginal('status');
    }


}
