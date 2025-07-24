<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    
    protected $fillable = [
        'product_id',
        'custom_name',
        'file_name',
        'file_path',
        'is_hidden',
        'is_downloadable',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

}
