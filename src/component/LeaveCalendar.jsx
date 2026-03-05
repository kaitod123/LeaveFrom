import React, { useState, useEffect } from 'react';

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับเก็บข้อมูลคนที่ถูกคลิกเพื่อแสดงใน Modal
  const [selectedLeave, setSelectedLeave] = useState(null);

  // ดึงข้อมูลการลาทั้งหมดจาก API
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/leave-request', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const leavesData = Array.isArray(data) ? data : (data.data || []);
        setLeaves(leavesData);
      } else {
        console.error("❌ API ตอบกลับด้วยสถานะ:", res.status);
      }
    } catch (err) {
      console.error("❌ ไม่สามารถดึงข้อมูลการลาได้:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); 

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getLeavesForDate = (day) => {
    if (!day) return [];
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return leaves.filter(leave => {
      const startVal = leave.startDate || leave.start_date || '';
      const endVal = leave.endDate || leave.end_date || '';
      
      const start = startVal ? startVal.substring(0, 10) : '';
      const end = endVal ? endVal.substring(0, 10) : '';
      
      return dateString >= start && dateString <= end;
    });
  };

  const getLeaveColor = (type) => {
    const leaveType = type || '';
    if (leaveType.includes('พักผ่อน')) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    if (leaveType.includes('กิจ')) return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
    if (leaveType.includes('ป่วย') || leaveType.includes('คลอด')) return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
  };

  const getLeaveHeaderColor = (type) => {
    const leaveType = type || '';
    if (leaveType.includes('พักผ่อน')) return 'bg-blue-100 border-blue-200 text-blue-900';
    if (leaveType.includes('กิจ')) return 'bg-teal-100 border-teal-200 text-teal-900';
    if (leaveType.includes('ป่วย') || leaveType.includes('คลอด')) return 'bg-rose-100 border-rose-200 text-rose-900';
    return 'bg-gray-100 border-gray-200 text-gray-900';
  };

  const formatDateThai = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 10);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543}`;
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return (
    <div className="p-6 max-w-7xl mx-auto font-sarabun relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📅 ปฏิทินการลา
          </h2>
          <p className="text-sm text-gray-500">ตรวจสอบผู้ที่อยู่ระหว่างการลาในแต่ละวัน (คลิกที่ชื่อเพื่อดูรายละเอียด)</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <button onClick={prevMonth} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 rounded text-gray-700 font-bold transition">◀</button>
          <button onClick={goToday} className="px-4 py-1 hover:bg-gray-100 rounded text-blue-600 font-bold transition">วันนี้</button>
          <button onClick={nextMonth} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 rounded text-gray-700 font-bold transition">▶</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="bg-gray-50 p-4 border-b border-gray-200 text-center relative rounded-t-xl">
            <h3 className="text-xl font-bold text-gray-800">
                เดือน {monthNames[month]} พ.ศ. {year + 543}
            </h3>
            {loading && <span className="absolute right-4 top-4 text-sm text-blue-500 animate-pulse font-bold">⏳ กำลังโหลดข้อมูล...</span>}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-xl">
          {dayNames.map((name, index) => (
            <div key={index} className="bg-gray-100 p-2 text-center text-sm font-bold text-gray-600">
              {name}
            </div>
          ))}

          {days.map((day, index) => {
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            const dayLeaves = getLeavesForDate(day);

            const isBottomLeft = index === days.length - 7;
            const isBottomRight = index === days.length - 1;

            return (
              <div 
                key={index} 
                className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50 ${!day ? 'bg-gray-50' : ''} ${isToday ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : ''} ${isBottomLeft ? 'rounded-bl-xl' : ''} ${isBottomRight ? 'rounded-br-xl' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-right font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {isToday ? <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center shadow-sm">{day}</span> : day}
                    </div>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[90px] pr-1 custom-scrollbar">
                      {dayLeaves.map((leave, idx) => {
                        const nameToDisplay = leave.fullname || leave.name || 'ไม่ระบุชื่อ';
                        
                        // 🛠️ ตรวจสอบทั้งชื่อ leaveType และ leave_type
                        const leaveTypeShow = leave.leaveType || leave.leave_type || '';

                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedLeave(leave)}
                            className={`text-xs p-1.5 rounded border transition-all cursor-pointer leading-tight hover:shadow-md hover:-translate-y-px active:scale-95 ${getLeaveColor(leaveTypeShow)}`}
                          >
                            <div className="font-bold truncate">{nameToDisplay}</div>
                            <div className="opacity-80 truncate text-[10px]">ชุด: {leave.duty || '-'}</div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm font-bold text-gray-700">
         <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-100 border border-blue-300 inline-block shadow-sm"></span> ลาพักผ่อน</div>
         <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-teal-100 border border-teal-300 inline-block shadow-sm"></span> ลากิจ</div>
         <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-100 border border-rose-300 inline-block shadow-sm"></span> ลาป่วย/คลอด</div>
      </div>

      {/* --- MODAL POPUP แสดงรายละเอียดเมื่อคลิก --- */}
      {selectedLeave && (() => {
        // 🛠️ ตรวจสอบประเภทการลาสำหรับ Modal ด้วย
        const selectedLeaveType = selectedLeave.leaveType || selectedLeave.leave_type || '';
        
        return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLeave(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b flex justify-between items-start ${getLeaveHeaderColor(selectedLeaveType)}`}>
                <div className="pr-4">
                    <p className="font-bold text-lg">
                        {selectedLeave.rank || ''} {selectedLeave.fullname || selectedLeave.name || 'ไม่ระบุชื่อ'}
                    </p>
                    <p className="text-sm opacity-80 mt-0.5">{selectedLeave.position || '-'}</p>
                </div>
                <button 
                  onClick={() => setSelectedLeave(null)} 
                  className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none"
                >
                  &times;
                </button>
            </div>

            <div className="p-5 space-y-3 text-[14px]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold">ประเภทการลา</span>
                    <span className={`px-2.5 py-1 rounded-md font-bold text-xs shadow-sm ${getLeaveColor(selectedLeaveType).replace('hover:', '').split(' ')[0]} ${getLeaveColor(selectedLeaveType).split(' ')[1]}`}>
                        {selectedLeaveType || '-'}
                    </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold">วันที่</span>
                    <span className="text-gray-800 font-medium">
                        {formatDateThai(selectedLeave.startDate || selectedLeave.start_date)} 
                        <span className="mx-1 text-gray-400">-</span> 
                        {formatDateThai(selectedLeave.endDate || selectedLeave.end_date)}
                    </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold">สังกัด/ชุด</span>
                    <span className="text-gray-800 text-right">{selectedLeave.duty || selectedLeave.affiliation || '-'}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-bold">เหตุผลการลา</span>
                    <span className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        {selectedLeave.reason || 'ไม่ระบุเหตุผล'}
                    </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500 font-bold">เบอร์ติดต่อ</span>
                    <span className="text-blue-600 font-bold">{selectedLeave.phone || '-'}</span>
                </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button 
                  onClick={() => setSelectedLeave(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
                >
                  ปิดหน้าต่าง
                </button>
            </div>
          </div>
        </div>
      )})}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default LeaveCalendar;