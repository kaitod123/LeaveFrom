<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'fullname', 
        'rank',        // <--- เพิ่ม
        'position',    // <--- เพิ่ม
        'affiliation', // <--- เพิ่ม
        'phone', 
        'duty',
        'leave_type', 
        'start_date', 
        'end_date', 
        'create_date',
        'reason', 
        'status',     // <--- เพิ่ม: สถานะการอนุมัติ
        'pdf_path'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}