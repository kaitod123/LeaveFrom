<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commander extends Model
{
    use HasFactory;

    protected $fillable = [
        'key_match',
        'cmd_rank',
        'cmd_name',
        'cmd_position',
        'sup_rank',
        'sup_name',
        'sup_position'
    ];
}