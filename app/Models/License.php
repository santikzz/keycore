<?php

namespace App\Models;

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
        ============= MODEL METHODS =============
    */

    public function timeLeft()
    {
        $now = Carbon::now();
        $diff = Carbon::parse($this->activated_at)->diffInSeconds($now);
        $floor = floor($diff);
        return $floor > 0 ? $floor : 0;
    }

    public function timeLeftHuman()
    {
        $timeLeft = $this->timeLeft();

        if ($timeLeft <= 0) {
            return '0 seconds';
        }

        return CarbonInterval::seconds($timeLeft)
            ->cascade()
            ->forHumans(['short' => true]);
    }

    /*
        ============= MODEL SCOPES =============
    */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

}
