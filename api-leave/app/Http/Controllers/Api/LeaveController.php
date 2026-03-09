<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;        

class LeaveController extends Controller
{
    public function publicIndex(Request $request)
    {
        $duty = $request->query('duty');
        if (!$duty) return response()->json([]);

        $query = LeaveRequest::query();
        $query->where('duty', $duty);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('fullname', 'LIKE', "%{$search}%")
                  ->orWhere('leave_type', 'LIKE', "%{$search}%")
                  ->orWhere('status', 'LIKE', "%{$search}%");
            });
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();
        return response()->json($leaves);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = LeaveRequest::query();

        if ($user && $user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();
        return response()->json($leaves);
    }

    public function getLeaderInfo(Request $request)
    {
        $match = $request->query('match');
        $leader = DB::table('commanders')->where('key_match', $match)->first();
        
        if (!$leader) {
            return response()->json([
                'cmd_rank' => 'พ.ต.ท.',
                'cmd_name' => '..........................',
                'cmd_position' => 'สวป.สภ.เมืองนครราชสีมา',
                'sup_rank' => 'พ.ต.อ.',
                'sup_name' => 'ศิริชัย ศรีชัยปัญญา',
                'sup_position' => 'ผกก.สภ.เมืองนครราชสีมา'
            ]);
        }
        return response()->json($leader);
    }

    // ==========================================
    // ระบบจัดการผู้บังคับบัญชา (Commander CRUD)
    // ==========================================
    public function getCommanders()
    {
        return response()->json(DB::table('commanders')->orderBy('key_match', 'asc')->get());
    }

    public function storeCommander(Request $request)
    {
        $data = $request->validate([
            'key_match' => 'required|string|unique:commanders,key_match',
            'cmd_rank' => 'nullable|string',
            'cmd_name' => 'required|string',
            'cmd_position' => 'required|string',
            'sup_rank' => 'nullable|string',
            'sup_name' => 'nullable|string',
            'sup_position' => 'nullable|string',
        ]);
        
        DB::table('commanders')->insert(
            array_merge($data, ['created_at' => now(), 'updated_at' => now()])
        );
        
        return response()->json(['message' => 'บันทึกข้อมูลผู้บังคับบัญชาสำเร็จ']);
    }

    public function updateCommander(Request $request, $id)
    {
        $data = $request->validate([
            'cmd_rank' => 'nullable|string',
            'cmd_name' => 'required|string',
            'cmd_position' => 'required|string',
            'sup_rank' => 'nullable|string',
            'sup_name' => 'nullable|string',
            'sup_position' => 'nullable|string',
        ]);

        DB::table('commanders')->where('id', $id)->update(
            array_merge($data, ['updated_at' => now()])
        );

        return response()->json(['message' => 'อัปเดตข้อมูลสำเร็จ']);
    }

    public function destroyCommander($id)
    {
        DB::table('commanders')->where('id', $id)->delete();
        return response()->json(['message' => 'ลบข้อมูลสำเร็จ']);
    }

    // ==========================================
    // ระบบสร้างและจัดการใบลา
    // ==========================================
    public function store(Request $request)
    {
        $startDate = $request->input('startDate') ?? $request->input('start_date');
        $endDate = $request->input('endDate') ?? $request->input('end_date');
        $fullname = $request->input('fullname') ?? $request->input('name');

        if (!$startDate || !$endDate || !$fullname) {
            return response()->json([
                'message' => 'ข้อมูลไม่ครบถ้วน',
                'errors' => [
                    'startDate' => !$startDate ? ['กรุณาระบุ ลาตั้งแต่วันที่'] : [],
                    'endDate' => !$endDate ? ['กรุณาระบุ ถึงวันที่'] : [],
                    'fullname' => !$fullname ? ['กรุณาระบุ ชื่อผู้ลา'] : [],
                ]
            ], 422);
        }

        try {
            $user = $request->user();
            
            $leave = new LeaveRequest();
            $leave->user_id = $user ? $user->id : 1; 
            $leave->fullname = $fullname;
            $leave->rank = $request->input('rank');
            $leave->position = $request->input('position');
            $leave->affiliation = $request->input('affiliation', 'สภ.เมืองนครราชสีมา');
            $leave->duty = $request->input('duty');
            $leave->phone = $request->input('phone');
            $leave->leave_type = $request->input('leaveType') ?? $request->input('leave_type') ?? 'ลาพักผ่อน';
            $leave->start_date = $startDate;
            $leave->end_date = $endDate;
            $leave->create_date = $request->input('createDate') ?? $request->input('create_date') ?? now()->toDateString();
            $leave->reason = $request->input('reason');
            $leave->status = 'pending';
            $leave->save();
            
            $leader = DB::table('commanders')
                        ->where('key_match', $leave->duty)
                        ->orWhere('key_match', $leave->affiliation)
                        ->first();

            $saveDir = storage_path('app/public/leaves');
            if (!file_exists($saveDir)) {
                mkdir($saveDir, 0777, true);
            }

            $templateFile = 'template.docx'; 
            if (str_contains($leave->leave_type, 'ลากิจ')) $templateFile = 'template2.docx';
            elseif (str_contains($leave->leave_type, 'ป่วย') || str_contains($leave->leave_type, 'คลอด')) $templateFile = 'template3.docx';

            $templatePath = storage_path('app/' . $templateFile);
            
            if (!file_exists($templatePath)) {
                return response()->json([
                    'status' => 'success', 
                    'message' => 'บันทึกข้อมูลลงระบบสำเร็จ (แต่ไม่พบไฟล์เทมเพลต ' . $templateFile . ')',
                    'downloadUrl' => null
                ]);
            }

            $templateProcessor = new TemplateProcessor($templatePath);
            
            // แทนที่ข้อมูลผู้บังคับบัญชา
            $templateProcessor = public_path('cmd_rank', $leader ? $leader->cmd_rank : 'พ.ต.ท.');
            $templateProcessor = public_path('cmd_name', $leader ? $leader->cmd_name : '....................');
            $templateProcessor = public_path('cmd_position', $leader ? $leader->cmd_position : 'สวป.สภ.เมืองนครราชสีมา');
            
            $templateProcessor = public_path('sup_rank', $leader ? $leader->sup_rank : 'พ.ต.อ.');
            $templateProcessor = public_path('sup_name', $leader ? $leader->sup_name : 'ศิริชัย ศรีชัยปัญญา');
            $templateProcessor = public_path('sup_position', $leader ? $leader->sup_position : 'ผกก.สภ.เมืองนครราชสีมา');

            // --- เริ่ม: แทนที่ตัวแปรลงใน Word ให้ครบถ้วน ---
            $cleanName = trim(str_replace($leave->rank ?? '', '', $leave->fullname));
            $templateProcessor = public_path('fullname', $cleanName);
            $templateProcessor = public_path('rank', $leave->rank ?? '');
            $templateProcessor = public_path('position', $leave->position ?? '');
            $templateProcessor = public_path('affiliation', $leave->affiliation ?? 'สภ.เมืองนครราชสีมา');
            $templateProcessor = public_path('duty', $leave->duty ?? '');
            $templateProcessor = public_path('contact', $this->toThaiNum($leave->phone));
            
            $templateProcessor = public_path('leaveRight', $this->toThaiNum($request->input('leaveRight', 10)));
            $templateProcessor = public_path('reason', $leave->reason ?? '-');

            $cDate = Carbon::parse($leave->create_date);
            $templateProcessor = public_path('day', $this->toThaiNum($cDate->day));
            $templateProcessor = public_path('month', $this->getThaiMonth($cDate->month));
            $templateProcessor = public_path('year', $this->toThaiNum($cDate->year + 543));
            $templateProcessor = public_path('cMonth', $this->getThaiMonth($cDate->month));

            $sDate = Carbon::parse($leave->start_date);
            $eDate = Carbon::parse($leave->end_date);
            
            $templateProcessor = public_path('sDay', $this->toThaiNum($sDate->day));
            $templateProcessor = public_path('sMonth', $this->getThaiMonth($sDate->month));
            $templateProcessor = public_path('sYear', $this->toThaiNum($sDate->year + 543));
            
            $templateProcessor = public_path('eDay', $this->toThaiNum($eDate->day));
            $templateProcessor = public_path('eMonth', $this->getThaiMonth($eDate->month));
            $templateProcessor = public_path('eYear', $this->toThaiNum($eDate->year + 543));
            
            $totalDays = $sDate->diffInDays($eDate) + 1;
            $templateProcessor = public_path('totalDays', $this->toThaiNum($totalDays));
            // --- สิ้นสุด: เพิ่มคำสั่งแทนที่ตัวแปร ---

            // ===============================================
            // 💡 ตั้งชื่อไฟล์ใหม่ให้เป็น ชื่อประเภทการลา_ยศ_ชื่อ_นามสกุล
            // ===============================================
            // 1. นำช่องว่างออกและแทนที่ด้วย _ เพื่อไม่ให้ไฟล์มีปัญหา
            $safeName = str_replace(' ', '_', $leave->fullname);
            // 2. สร้างรูปแบบชื่อไฟล์: ใบลาพักผ่อน_ร.ต.อ._คณาวุฒิ_เจริญศิริ_20240224_153020.docx
            $fileName = 'ใบ' . $leave->leave_type .'_'. $safeName . '' . '.docx';
            
            $templateProcessor = public_path($saveDir . '/' . $fileName);

            return response()->json([
                'status' => 'success', 
                // ใช้ rawurlencode เฉพาะส่วนชื่อไฟล์ เพื่อป้องกัน Error เมื่อมีภาษาไทยใน URL
                'downloadUrl' => url('storage/leaves/' . rawurlencode($fileName))
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'ระบบหลังบ้านเกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['message' => 'Unauthorized'], 403);
        $request->validate(['status' => 'required|in:approved,rejected,pending']);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status;
        $leave->save();

        return response()->json(['status' => 'success', 'message' => 'อัปเดตสถานะสำเร็จ']);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            $leave = LeaveRequest::where('id', $id)->where('user_id', $request->user()->id)->first();
            if (!$leave) return response()->json(['message' => 'Unauthorized'], 403);
        } else {
            $leave = LeaveRequest::findOrFail($id);
        }

        if ($leave->pdf_path) Storage::disk('public')->delete($leave->pdf_path);
        $leave->delete();

        return response()->json(['status' => 'success', 'message' => 'ลบข้อมูลสำเร็จ']);
    }

    public function uploadPdf(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') return response()->json(['message' => 'Unauthorized'], 403);
        $request->validate(['pdf' => 'required|mimes:pdf|max:5120']);

        $leave = LeaveRequest::findOrFail($id);
        if ($request->hasFile('pdf')) {
            $file = $request->file('pdf');
            $fileName = 'Approved_' . $id . '_' . time() . '.pdf';
            $path = $file->storeAs('leaves/approved', $fileName, 'public');
            
            $leave->pdf_path = $path;
            $leave->save();

            return response()->json(['status' => 'success', 'path' => $path]);
        }
        return response()->json(['message' => 'No file'], 400);
    }

    public function downloadWord(Request $request, $id)
    {
        try {
            $leave = LeaveRequest::with('user')->findOrFail($id);
            $user = $leave->user;
            
            $templateFile = 'template.docx'; 
            if ($leave->leave_type === 'ลากิจ') $templateFile = 'template2.docx';
            elseif ($leave->leave_type === 'ลาป่วย') $templateFile = 'template3.docx';

            // 💡 แก้ไข: ชี้ไปที่โฟลเดอร์ public
            $templatePath = public_path($templateFile);
            if (!file_exists($templatePath)) return response()->json(['message' => 'Template not found: ' . $templateFile], 404);

            $templateProcessor = new TemplateProcessor($templatePath);

            $rank = $leave->rank ?? $user->rank ?? $this->extractRank($leave->fullname);
            $position = $leave->position ?? $user->position ?? '';
            $affiliation = $leave->affiliation ?? $user->affiliation ?? 'สภ.เมืองนครราชสีมา';
            
            $cleanName = trim(str_replace($rank, '', $leave->fullname));

            // 💡 แก้ไข: ใช้ setValue()
            $templateProcessor->setValue('rank', $rank ?: '');
            $templateProcessor->setValue('fullname', $cleanName);
            $templateProcessor->setValue('position', $position ?: '');
            $templateProcessor->setValue('affiliation', $affiliation);
            $templateProcessor->setValue('duty', $leave->duty ?? '');
            $templateProcessor->setValue('contact', $this->toThaiNum($leave->phone));
            $templateProcessor->setValue('leaveRight', $this->toThaiNum(10)); 

            $cDate = Carbon::parse($leave->create_date);
            $templateProcessor->setValue('day', $this->toThaiNum($cDate->day));
            $templateProcessor->setValue('month', $this->getThaiMonth($cDate->month));
            $templateProcessor->setValue('year', $this->toThaiNum($cDate->year + 543));
            $templateProcessor->setValue('cMonth', $this->getThaiMonth($cDate->month));

            $sDate = Carbon::parse($leave->start_date);
            $eDate = Carbon::parse($leave->end_date);
            $templateProcessor->setValue('sDay', $this->toThaiNum($sDate->day));
            $templateProcessor->setValue('sMonth', $this->getThaiMonth($sDate->month));
            $templateProcessor->setValue('sYear', $this->toThaiNum($sDate->year + 543));
            $templateProcessor->setValue('eDay', $this->toThaiNum($eDate->day));
            $templateProcessor->setValue('eMonth', $this->getThaiMonth($eDate->month));
            $templateProcessor->setValue('eYear', $this->toThaiNum($eDate->year + 543));
            
            $totalDays = $sDate->diffInDays($eDate) + 1;
            $templateProcessor->setValue('totalDays', $this->toThaiNum($totalDays));
            $templateProcessor->setValue('reason', $leave->reason ?? '-');

            $leader = DB::table('commanders')->where('key_match', $leave->duty)->first();
            $templateProcessor->setValue('cmd_rank', $leader ? $leader->cmd_rank : 'ร.ต.อ.');
            $templateProcessor->setValue('cmd_name', $leader ? $leader->cmd_name : ''); 
            $templateProcessor->setValue('cmd_position', $leader ? $leader->cmd_position : 'รอง สวป.สภ.เมืองนครราชสีมา');

            $safeName = str_replace(' ', '_', $leave->fullname);
            $outputName = 'ใบ' . $leave->leave_type . '_' . $safeName . '_' . date('Ymd_His') . '.docx';
            
            $outputPath = storage_path('app/public/' . $outputName);
            
            // 💡 แก้ไข: ต้อง saveAs ก่อนถึงจะดาวน์โหลดได้
            $templateProcessor->saveAs($outputPath);

            return response()->download($outputPath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    private function extractRank($fullname) {
        $ranks = ["พล.ต.ท.", "พล.ต.ต.", "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.", "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.", "ด.ต.", "จ.ส.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต."];
        foreach ($ranks as $rank) {
            if (strpos($fullname, $rank) !== false) return $rank;
        }
        return "";
    }

    private function getThaiMonth($m) {
        $months = ["","มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
        return $months[$m] ?? '';
    }

    private function toThaiNum($num) {
        return str_replace(['0','1','2','3','4','5','6','7','8','9'],['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'],strval($num));
    }
}