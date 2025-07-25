<?php

namespace App\Enums;

enum Codes: string
{

    case TOO_MANY_REQUESTS = 'too_many_requests';
    case SSL_ERROR = 'ssl_error';
    case INVALID = 'invalid';
    case UNUSED = 'unused';
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case HWID_MISMATCH = 'hwid_mismatch';

}