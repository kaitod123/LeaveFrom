<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // ฟังก์ชันเข้าสู่ระบบ
    public function login(Request $request)
    {
        // 1. ตรวจสอบข้อมูลที่ส่งมา
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // 2. ค้นหา User จากฐานข้อมูล
        $user = User::where('username', $request->username)->first();

        // 3. ถ้าไม่พบผู้ใช้ หรือ รหัสผ่านไม่ตรง
        if (!$user || !Hash::check($request->password, $user->password)) {
            // สำคัญ: ต้องตอบกลับเป็น JSON พร้อม Status 401 (Unauthorized) ห้ามใช้ redirect()
            return response()->json([
                'message' => 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
            ], 401);
        }

        // 4. สร้าง Token สำหรับการใช้งาน API
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. ตอบกลับเป็น JSON ข้อมูล Token และข้อมูล User
        return response()->json([
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'token' => $token,
            'user' => $user
        ]);
    }

    // ฟังก์ชันเพิ่มสมาชิก
    public function register(Request $request)
    {
        // ตรวจสอบว่าได้มีการ Validate 'email' ด้วย (ตามที่ตกลงกันไว้)
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|unique:users',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        // สร้าง User ใหม่
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
            'rank' => $request->rank ?? 'ส.ต.ต.',
            'position' => $request->position ?? 'ผบ.หมู่(ป.)',
            'duty' => $request->duty ?? 'สายตรวจชุดที่ ๑',
            'phone' => $request->phone ?? null,
        ]);

        return response()->json([
            'message' => 'เพิ่มสมาชิกสำเร็จ', 
            'user' => $user
        ], 201);
    }
}