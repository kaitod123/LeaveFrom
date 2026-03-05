import React, { useState } from 'react';

const LeaveForm = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    leaveType: 'ลาป่วย',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 p-8 gap-6">
      {/* ส่วนที่ 1: ฟอร์มกรอกข้อมูล */}
      <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">กรอกข้อมูลใบลา</h2>
        <div className="space-y-4">
          <input name="fullname" placeholder="ชื่อ-นามสกุล" className="w-full border p-2 rounded" onChange={handleChange} />
          <input name="phone" placeholder="เบอร์โทรศัพท์" className="w-full border p-2 rounded" onChange={handleChange} />
          <select name="leaveType" className="w-full border p-2 rounded" onChange={handleChange}>
            <option>ลาป่วย</option>
            <option>ลากิจ</option>
            <option>ลาพักร้อน</option>
          </select>
          <div className="flex gap-2">
            <input type="date" name="startDate" className="w-1/2 border p-2 rounded" onChange={handleChange} />
            <input type="date" name="endDate" className="w-1/2 border p-2 rounded" onChange={handleChange} />
          </div>
          <textarea name="reason" placeholder="เหตุผลการลา" className="w-full border p-2 rounded" onChange={handleChange}></textarea>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">ส่งข้อมูล</button>
        </div>
      </div>

      {/* ส่วนที่ 2: พรีวิวใบลา (จำลองกระดาษ A4) */}
      <div className="w-2/3 bg-white p-12 rounded-lg shadow-md border border-gray-300 min-h-[842px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif">ใบลาพักงาน</h1>
        </div>
        <div className="space-y-6 text-lg">
          <p className="text-right">วันที่......../......../........</p>
          <p>เรียน ผู้จัดการ / หัวหน้างาน</p>
          <p>ข้าพเจ้า <strong>{formData.fullname || "................................"}</strong></p>
          <p>เบอร์โทรศัพท์ที่ติดต่อได้: <strong>{formData.phone || "................................"}</strong></p>
          <p>มีความประสงค์ขอ <strong>{formData.leaveType}</strong></p>
          <p>ตั้งแต่วันที่ <strong>{formData.startDate || ".........."}</strong> ถึง <strong>{formData.endDate || ".........."}</strong></p>
          <p>เนื่องจาก: {formData.reason || "........................................................"}</p>
          <div className="mt-20 flex justify-end">
            <div className="text-center">
              <p>ลงชื่อ........................................</p>
              <p>( {formData.fullname || "................................"} )</p>
            </div>
          </div>    
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
