<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'product_code'
    ];

    /*
        ============= MODEL RELATIONS =============
    */

    public function licenses()
    {
        return $this->hasMany(License::class);
    }

}
