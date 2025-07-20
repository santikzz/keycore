<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blacklist extends Model
{
    protected $fillable = [
        'type', // 'ip', 'hwid', 'mac'
        'value',
        'description',
    ];

}
