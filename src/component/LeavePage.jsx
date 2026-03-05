import React, { useState } from 'react';
// แก้ไข Import ให้ตรงกับชื่อไฟล์จริง (LeaveFrom)
import LeaveForm from './LeaveFrom';   // ลาพักผ่อน
import LeaveForm2 from './LeaveFrom2'; // ลากิจ
import LeaveForm3 from './LeaveFrom3'; // ลาป่วย

const LeavePage = ({ user }) => {
  // State เก็บประเภทการลาที่เลือก (เริ่มต้นเป็น ลาพักผ่อน)
  const [selectedType, setSelectedType] = useState('ลาพักผ่อน');

  // ฟังก์ชันเลือก Render ตาม State
  const renderForm = () => {
    switch (selectedType) {
      case 'ลาพักผ่อน':
        return <LeaveFrom user={user} type="ลาพักผ่อน" />;
      case 'ลากิจ':
        return <LeaveFrom2 user={user} type="ลากิจ" />;
      case 'ลาป่วย':
        return <LeaveFrom3 user={user} type="ลาป่วย" />;
      default:
        return <LeaveFrom user={user} type="ลาพักผ่อน" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sarabun">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* ส่วน Header และตัวเลือกประเภท */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-2xl">📑</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ระบบบันทึกการลา</h1>
              <p className="text-gray-500 text-sm">กรุณาเลือกประเภทการลาที่ต้องการบันทึก</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
            <span className="text-sm font-semibold text-gray-600 pl-2">ประเภทใบลา:</span>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border-0 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 py-2 font-bold shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="ลาพักผ่อน">🏖️ ลาพักผ่อน</option>
              <option value="ลากิจ">💼 ลากิจ</option>
              <option value="ลาป่วย">🤒 ลาป่วย</option>
            </select>
          </div>

        </div>

        {/* แสดงผล Component ฟอร์มที่เลือก */}
        <div className="animate-fade-in-up">
          {renderForm()}
        </div>

      </div>
      
      {/* Animation Utility */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LeavePage;