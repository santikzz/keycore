<?php

namespace App\Services;

class LicenseGenerateService
{

    public static function create()
    {
        // create a random license key in the format XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
        // Using 24 random bytes (192 bits of entropy) for maximum security
        $key = strtoupper(bin2hex(random_bytes(24)));
        return substr($key, 0, 4) . '-' .
            substr($key, 4, 4) . '-' .
            substr($key, 8, 4) . '-' .
            substr($key, 12, 4) . '-' .
            substr($key, 16, 4) . '-' .
            substr($key, 20, 4);
    }

}