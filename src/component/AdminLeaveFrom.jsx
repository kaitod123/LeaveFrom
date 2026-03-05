import React, { useState, useEffect } from 'react';

const AdminLeaveForm = ({ user, type }) => {
  const [formData, setFormData] = useState({
    fullname: '', // เริ่มต้นเป็นค่าว่างเพื่อให้ Admin กรอกเอง
    rank: 'ส.ต.ต.', 
    position: 'ผบ.หมู่(ป.)', 
    affiliation: 'สภ.เมืองนครราชสีมา', 
    duty: 'สายตรวจชุดที่ ๑',
    leaveType: 'ลาพักผ่อน', 
    startDate: '',
    endDate: '',
    createDate:'',
    totalDays: '0', 
    accumulatedDays: '0', 
    leaveRight: '10', 
    totalRightDays: '10', 
    phone: '',
    reason: '', 
  });

  // สถานะสำหรับเก็บข้อมูลผู้บังคับบัญชาจาก DB
  const [leaderPreview, setLeaderPreview] = useState({
      cmd_rank: 'พ.ต.ท.',
      cmd_name: '..........................',
      cmd_position: 'สวป.สภ.เมืองนครราชสีมา',
      sup_rank: 'พ.ต.อ.',
      sup_name: 'ศิริชัย ศรีชัยปัญญา',
      sup_position: 'ผกก.สภ.เมืองนครราชสีมา'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

    // State สำหรับ Modal แจ้งเตือน
    const [modal, setModal] = useState({ show: false, type: 'success', title: '', message: '' });
  
    // ฟังก์ชันเรียก Modal
    const showAlert = (title, message, type = 'error') => {
        setModal({ show: true, title, message, type });
    };
  
    const closeModal = () => {
        setModal({ ...modal, show: false });
        // ถ้าเป็น Success ให้รีเฟรชหรือทำอย่างอื่นต่อได้ (ในที่นี้แค่ปิด)
    };

  const ranks = ["พล.ต.ท.", "พล.ต.ต.", "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.", "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.", "ด.ต.", "จ.ส.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต."];
  const positions = ["ผบ.หมู่(ป.)", "ผบ.หมู่(สส.)", "ผบ.หมู่(จร.)", "ผบ.หมู่(ธร.)", "รอง สว.(ป.)", "รอง สว.(สส.)", "รอง สว.(จร.)", "รอง สว.(สอบสวน)", "สวป.", "สว.สส.", "สว.จร.", "สว.อก.", "รอง ผกก.ป.", "รอง ผกก.สส.", "รอง ผกก.(สอบสวน)", "ผกก."];
  const affiliations = ["สภ.เมืองนครราชสีมา"];
  const duties = ["สายตรวจชุดที่ ๑", "สายตรวจชุดที่ ๒", "สายตรวจชุดที่ ๓", "สายตรวจชุดที่ ๔", "สายตรวจตำบลบ้านเกาะ", "สายตรวจตำบลหมื่นไวย", "สายตรวจตำบลหนองกระทุ่ม", "สายตรวจร้านทอง-ธนาคาร", "สิบเวร", "ยามสถานี", "จราจร", "สอบสวน", "ธุรการ", "อื่นๆ"];

  // ดึงข้อมูล Leader จาก API ตามหน้าที่ (duty)
  const fetchLeaderInfo = async (matchValue) => {
      try {
          const response = await fetch(`https://po-leave-backend.onrender.com/api/leader-info?match=${matchValue}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await response.json();
          if (data) setLeaderPreview(data);
      } catch (error) {
          console.error("Fetch leader error:", error);
      }
  };

  useEffect(() => {
    // กำหนดค่าเริ่มต้นครั้งแรก
    if (user && formData.fullname === '') {
        setFormData(prev => ({ ...prev, fullname: user.fullname || '' }));
    }
  }, [user]);

  // ติดตามการเปลี่ยนค่า duty เพื่อไปดึงข้อมูลผู้บังคับบัญชา
  useEffect(() => {
      if (formData.duty) {
          fetchLeaderInfo(formData.duty);
      }
  }, [formData.duty]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        setFormData(prev => ({ ...prev, totalDays: diffDays.toString() }));
    }
  }, [formData.startDate, formData.endDate]);

  const toThaiNum = (num) => num?.toString().replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[d]) || '';

  const formatDateThai = (dateString) => {
    if (!dateString) return { day: '...', month: '................', year: '....' };
    const date = new Date(dateString);
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return { day: toThaiNum(date.getDate()), month: months[date.getMonth()], year: toThaiNum(date.getFullYear() + 543) };
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert("แจ้งเตือน", "Session หมดอายุ กรุณา Login ใหม่", "error");
        return;
    }

    if (!formData.startDate || !formData.endDate) {
        showAlert("ข้อมูลไม่ครบ", "กรุณาระบุวันที่จะลาให้ครบถ้วน", "warning");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
          ...formData,
          createDate: new Date().toISOString().slice(0, 10),
          cmonth: new Date().toISOString().slice(0, 10) 
      };

      const response = await fetch('https://po-leave-backend.onrender.com/api/leave-request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
         if (result.errors) {
            const errorMsg = Object.values(result.errors).flat().join('\n');
            throw new Error(errorMsg);
         }
         throw new Error(result.message || `Server Error: ${response.status}`);
      }

      // ✅ ใช้ Modal แทน Alert
      showAlert("สำเร็จ", "บันทึกข้อมูลและสร้างใบลาเรียบร้อยแล้ว", "success");
      
      if (result.downloadUrl) {
          // หน่วงเวลาเล็กน้อยให้ Modal ขึ้นก่อนค่อยเด้ง Tab ใหม่
          setTimeout(() => window.open(result.downloadUrl, '_blank'), 1500);
      }

    } catch (error) {
      console.error(error);
      // ❌ แสดง Error ผ่าน Modal (รวมถึงกรณีโควตาเต็ม)
      showAlert("ทำรายการไม่สำเร็จ", error.message, "error");
    } finally {
        setIsSubmitting(false);
    }
  };
  const dStart = formatDateThai(formData.startDate);
  const dEnd = formatDateThai(formData.endDate);
  const today = formatDateThai(new Date());

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sarabun text-sm p-6 bg-gray-100 min-h-screen">
       {/* ฝั่งฟอร์ม */}
              {/* --- Custom Modal --- */}
       {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 animate-pop-in border-l-8 ${
                modal.type === 'success' ? 'border-green-500' : 
                modal.type === 'warning' ? 'border-yellow-500' : 'border-red-500'
            }`}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full text-2xl ${
                            modal.type === 'success' ? 'bg-green-100 text-green-600' : 
                            modal.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {modal.type === 'success' ? '✅' : modal.type === 'warning' ? '⚠️' : '⛔'}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{modal.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{modal.message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button 
                        onClick={closeModal} 
                        className={`px-6 py-2 rounded-lg font-bold shadow-lg transform transition hover:scale-105 active:scale-95 text-white ${
                            modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                            modal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
       )}
       <div className="w-full lg:w-1/3 flex flex-col h-fit">
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             <div className="bg-gradient-to-r from-red-700 to-red-600 p-5 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">⚙️ ระบบจัดการใบลา (Admin)</h2>
                <p className="text-red-100 text-xs mt-1">สามารถแก้ไขชื่อผู้ลาและรายละเอียดได้อิสระ</p>
             </div>
             
             <div className="p-6 space-y-5">
                <div className="space-y-3">
                    <p className="section-title">ข้อมูลผู้ลา (พิมพ์แก้ไขได้)</p>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="label">ยศ</label>
                            <select name="rank" className="input-field" value={formData.rank} onChange={handleChange}>
                                {ranks.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="label">ชื่อ-นามสกุล</label>
                            {/* แก้ไขให้ Input นี้ไม่เป็น ReadOnly */}
                            <input 
                                name="fullname" 
                                value={formData.fullname} 
                                onChange={handleChange}
                                placeholder="พิมพ์ชื่อ-นามสกุล"
                                className="input-field border-blue-300 focus:ring-red-400" 
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="label">ปฏิบัติหน้าที่</label>
                    <select name="duty" className="input-field" value={formData.duty} onChange={handleChange}>
                        {duties.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                    <label className="label">สังกัด</label>
                    <select name="affiliations" className="input-field" value={formData.affiliations} onChange={handleChange}>
                        {affiliations.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                    <label className="label">ตำแหน่ง</label>
                    <select name="position" className="input-field" value={formData.positions} onChange={handleChange}>
                        {positions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                    </select>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-800">
                        <strong>เสนอ:</strong> {leaderPreview.cmd_rank} {leaderPreview.cmd_name} <br/>
                        ({leaderPreview.cmd_position})
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-800 mb-2">📊 สถิติวันลา</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="label">สะสม</label><input type="number" name="accumulatedDays" className="input-field text-center" value={formData.accumulatedDays} onChange={handleChange} /></div>
                        <div><label className="label">สิทธิปีนี้</label><input type="number" name="leaveRight" className="input-field text-center" readOnly value={formData.leaveRight} onChange={handleChange} /></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">จากวันที่</label><input type="date" name="startDate" className="input-field" onChange={handleChange} /></div>
                    <div><label className="label">ถึงวันที่</label><input type="date" name="endDate" className="input-field" onChange={handleChange} /></div>
                </div>
                                <div>
                    <p className="section-title">การติดต่อ</p>
                    <div>
                        <label className="label">เบอร์โทรศัพท์ที่ติดต่อได้</label>
                        <input name="phone" className="input-field" placeholder="เช่น 081-234-5678" onChange={handleChange} />
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn-submit bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700">
                    {isSubmitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกและสร้างใบลา'}
                </button>
             </div>
         </div>
       </div>

       {/* ฝั่ง Preview */}
       <div className="w-full lg:w-2/3 flex justify-center items-start overflow-auto">
            <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-16 pt-10 text-[16px] leading-relaxed relative text-black transform scale-[0.85] lg:scale-100 origin-top">
                <div className="absolute top-12 right-12 font-bold text-lg">แบบใบลาพักผ่อน (Admin)</div>
                <div className="text-right mr-4 mb-4 mt-12">วันที่ {today.day} เดือน {today.month} พ.ศ. {today.year}</div>
                <div className="mb-6 font-bold">
                    <p>เรื่อง &nbsp;&nbsp; ขอลาพักผ่อน</p>
                    <p>เรียน &nbsp;&nbsp; ผกก.สภ.เมืองนครราชสีมา</p>
                </div>

                <div className="indent-12 text-justify leading-loose">
                    <p>
                        ข้าพเจ้า <span className="data-line min-w-[150px]">{formData.rank} {formData.fullname || '.........................'}</span> 
                        ตำแหน่ง <span className="data-line min-w-[150px]">{formData.position}</span>
                    </p>
                    <p>
                        ขอลาพักผ่อนตั้งแต่วันที่ <span className="data-line min-w-[120px]">{dStart.day} {dStart.month} {dStart.year}</span>
                        ถึงวันที่ <span className="data-line min-w-[120px]">{dEnd.day} {dEnd.month} {dEnd.year}</span>
                        กำหนด <span className="data-line min-w-[40px]">{toThaiNum(formData.totalDays)}</span> วัน
                    </p>
                    
                </div>
            
                <div className="mt-16 space-y-12">
                    <div className="flex justify-end mr-4">
                        <div className="text-center w-72">
                            <p>(ลงชื่อ) {leaderPreview.cmd_rank}...............................................</p>
                            <p>( {leaderPreview.cmd_name} )</p>
                            <p>{leaderPreview.cmd_position}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-12">
                        <div className="text-center w-80">
                            <p>(ลงชื่อ) {leaderPreview.sup_rank}...............................................</p>
                            <p>( {leaderPreview.sup_name} )</p>
                            <p>{leaderPreview.sup_position}</p>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       <style>{`
         .label { @apply block text-xs font-semibold text-gray-700 mb-1; }
         .section-title { @apply text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2; }
         .input-field { @apply w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400; }
         .btn-submit { @apply w-full text-white py-3 rounded-lg mt-6 font-bold shadow-md transition-all disabled:opacity-50; }
         .data-line { @apply border-b border-dotted border-black inline-block text-center px-1 text-red-700 font-bold; }
       `}</style>
    </div>
  );
};

export default AdminLeaveForm;