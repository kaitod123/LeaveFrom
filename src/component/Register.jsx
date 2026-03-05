import React, { useState } from 'react';

const Register = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '', // เพิ่มฟิลด์อีเมลสำหรับรีเซ็ตรหัสผ่าน
    password: '',
    password_confirmation: '',
    role: 'user',
    rank: 'ส.ต.ต.',
    position: 'ผบ.หมู่(ป.)',
    duty: 'สายตรวจชุดที่ ๑',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ตัวเลือก Dropdown
  const ranks = ["พล.ต.ท.", "พล.ต.ต.", "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.", "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.", "ด.ต.", "จ.ส.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต."];
  const positions = ["ผบ.หมู่(ป.)", "ผบ.หมู่(สส.)", "ผบ.หมู่(จร.)", "ผบ.หมู่(ธร.)", "รอง สว.(ป.)", "รอง สว.(สส.)", "รอง สว.(จร.)", "รอง สว.(สอบสวน)", "สวป.", "สว.สส.", "สว.จร.", "สว.อก.", "รอง ผกก.ป.", "รอง ผกก.สส.", "รอง ผกก.(สอบสวน)", "ผกก."];
  const duties = ["สายตรวจชุดที่ ๑", "สายตรวจชุดที่ ๒", "สายตรวจชุดที่ ๓", "สายตรวจชุดที่ ๔", "จราจร", "สอบสวน", "ธุรการ", "สิบเวร", "ยามสถานี", "อื่นๆ"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.password_confirmation) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('✅ เพิ่มสมาชิกใหม่สำเร็จ!');
        // ล้างฟอร์ม
        setFormData({ ...formData, name: '', username: '', email: '', password: '', password_confirmation: '', phone: '' });
        // ถ้ามีการส่ง onBack มา ให้รอ 1.5 วิแล้วกลับ
        if (onBack) {
            setTimeout(() => onBack(), 1500);
        }
      } else {
        // จัดการ Error แบบ Array ที่ส่งมาจาก Laravel Validator
        if (data.errors) {
             const errorMsg = Object.values(data.errors).flat().join('\n');
             setError(errorMsg);
        } else {
             setError(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
        }
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-700">➕ เพิ่มสมาชิกใหม่</h2>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold whitespace-pre-line border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-bold border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* แถวที่ 1: ข้อมูลล็อกอิน */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <p className="text-sm font-bold text-gray-500 uppercase">ข้อมูลการเข้าสู่ระบบ</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Username (ชื่อผู้ใช้)</label>
                    <input name="username" type="text" required value={formData.username} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">อีเมล (สำหรับรีเซ็ตรหัสผ่าน)</label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="example@gmail.com" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">รหัสผ่าน</label>
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                    <input name="password_confirmation" type="password" required value={formData.password_confirmation} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
        </div>

        {/* แถวที่ 2: ข้อมูลส่วนตัว */}
        <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4 mt-4">
             <p className="text-sm font-bold text-gray-500 uppercase">ข้อมูลเจ้าหน้าที่</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ยศ</label>
                    <select name="rank" value={formData.rank} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
                        {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ตำแหน่ง</label>
                    <select name="position" value={formData.position} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ปฏิบัติหน้าที่</label>
                    <select name="duty" value={formData.duty} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
                        {duties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">สิทธิ์การใช้งาน</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-blue-300 rounded font-bold text-blue-700 bg-blue-50">
                        <option value="user">User (ผู้ใช้ทั่วไป)</option>
                        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                    </select>
                </div>
             </div>
        </div>

        <div className="flex gap-4 mt-6">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
            >
                {loading ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกข้อมูลสมาชิก'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Register;