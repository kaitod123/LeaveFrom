<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http; // <-- เพิ่ม Http สำหรับส่ง API ไปหา LINE
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->email;

        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'ไม่พบอีเมลนี้ในระบบ'], 404);
        }

        $token = Str::random(64);
        
        DB::table('password_resets')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        // URL สำหรับกลับมาที่ React
        $resetUrl = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($email);

        // ตัดการส่ง LINE/Email ออก แล้วส่งลิงก์กลับไปให้ React แสดงผลตรงๆ
        return response()->json([
            'message' => 'สร้างลิงก์สำหรับรีเซ็ตรหัสผ่านสำเร็จ',
            'reset_link' => $resetUrl
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $resetData = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetData || Carbon::parse($resetData->created_at)->addMinutes(60)->isPast()) {
            return response()->json(['message' => 'ลิงก์หมดอายุหรือ Token ไม่ถูกต้อง'], 400);
        }

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password)
        ]);

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'เปลี่ยนรหัสผ่านสำเร็จแล้ว']);
    }
}