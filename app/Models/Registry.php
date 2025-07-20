<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registry extends Model
{
    protected $fillable = [
        'license_id',
        'hwid',
        'ip_address',
        'mac_address',
        'description', // i.e: failed attempt, etc.
    ];

    /*
        ============= MODEL RELATIONS =============
    */

    public function license()
    {
        return $this->belongsTo(License::class);
    }

}
