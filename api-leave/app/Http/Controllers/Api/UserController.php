<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; 

class UserController extends Controller
{
    // ดึงรายชื่อผู้ใช้งานทั้งหมด
    public function index(Request $request)
    {
        // ตรวจสอบสิทธิ์ว่าต้องเป็น Admin เท่านั้น
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
        }

        $users = User::orderBy('id', 'desc')->get();
        return response()->json($users);
    }

    // อัปเดตข้อมูลผู้ใช้งาน
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required',
            'username' => 'required|unique:users,username,' . $user->id,
            'role' => 'required'
        ]);

        $user->name = $request->name;
        $user->username = $request->username;
        $user->role = $request->role;
        
        // อัปเดตข้อมูลเพิ่มเติม (ยศ, ตำแหน่ง, เบอร์โทร, หน้าที่)
        if ($request->has('rank')) $user->rank = $request->rank;
        if ($request->has('position')) $user->position = $request->position;
        if ($request->has('phone')) $user->phone = $request->phone;
        if ($request->has('duty')) $user->duty = $request->duty;

        // ถ้ามีการระบุรหัสผ่านใหม่
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลสำเร็จ',
            'user' => $user
        ]);
    }

    // ลบผู้ใช้งาน
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
        }

        if ($request->user()->id == $id) {
            return response()->json(['message' => 'ไม่สามารถลบบัญชีตัวเองที่กำลังใช้งานอยู่ได้'], 400);
        }

        User::destroy($id);

        return response()->json([
            'status' => 'success',
            'message' => 'ลบผู้ใช้งานสำเร็จ'
        ]);
    }

    // --- ฟังก์ชัน Import CSV (ใหม่) ---
    public function import(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึง'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        
        if (($handle = fopen($file->getPathname(), 'r')) === FALSE) {
            return response()->json(['status' => 'error', 'message' => 'อ่านไฟล์ไม่สำเร็จ'], 500);
        }
        
        // ข้ามบรรทัดหัวตาราง (Header)
        fgetcsv($handle);

        $count = 0;
        
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
                // คาดหวังคอลัมน์ใน CSV:
                // 0: ยศ
                // 1: ชื่อ
                // 2: นามสกุล
                // 3: ตำแหน่ง
                // 4: เบอร์โทร (ใช้เป็น Username)
                // 5: ปฏิบัติหน้าที่

                // ตรวจสอบข้อมูลขั้นต่ำ (ต้องมีชื่อและเบอร์โทร)
                if (empty($row[1]) || empty($row[4])) continue;

                $rank = trim($row[0] ?? '');
                $fname = trim($row[1] ?? '');
                $lname = trim($row[2] ?? '');
                $position = trim($row[3] ?? '');
                $phone = trim($row[4] ?? '');
                $duty = trim($row[5] ?? '');

                // สร้างชื่อเต็ม (ยศ ชื่อ นามสกุล)
                $fullname = trim("$fname $lname");
                
                // ใช้เบอร์โทรเป็น Username (ตัดขีด/ช่องว่างออก)
                $username = preg_replace('/[^0-9]/', '', $phone);

                // ถ้า Username นี้มีอยู่แล้ว ให้ข้าม (ป้องกัน Error)
                if (User::where('username', $username)->exists()) {
                    continue; 
                }

                User::create([
                    'name' => $fullname,
                    'username' => $username,
                    'password' => Hash::make('1'), // กำหนดรหัสผ่านเป็น '1'
                    'role' => 'user',              // กำหนดสิทธิ์เป็น 'user'
                    'rank' => $rank,
                    'position' => $position,
                    'phone' => $phone,
                    'duty' => $duty
                ]);

                $count++;
            }
            
            DB::commit();
            fclose($handle);

            return response()->json([
                'status' => 'success', 
                'message' => "นำเข้าข้อมูลสำเร็จจำนวน $count รายการ"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return response()->json(['status' => 'error', 'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }
}