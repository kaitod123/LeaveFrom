import React, { useState } from 'react';

const ResetPassword = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [formData, setFormData] = useState({
    token: queryParams.get('token') || '',
    email: queryParams.get('email') || '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // เพิ่มบรรทัดนี้เพื่อป้องกัน Laravel เด้ง (Redirect) เมื่อเกิด Error
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: '✅ เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังนำท่านไปยังหน้าเข้าสู่ระบบ...' });
        setTimeout(() => window.location.href = '/', 3000);
      } else {
        // ดึงข้อความ Error เชิงลึกจาก Laravel กรณี Validate ไม่ผ่าน (เช่น รหัสไม่ตรงกัน)
        if (data.errors) {
            const errorMsg = Object.values(data.errors).flat().join(', ');
            setStatus({ type: 'error', msg: errorMsg });
        } else {
            setStatus({ type: 'error', msg: data.message || 'เกิดข้อผิดพลาด' });
        }
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'การรีเซ็ตล้มเหลว (ไม่สามารถเชื่อมต่อ Server)' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sarabun">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">กำหนดรหัสผ่านใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'กำลังโหลด...' : 'ยืนยันเปลี่ยนรหัสผ่าน'}
          </button>
        </form>

        {status.msg && (
          <div className={`mt-4 p-3 rounded text-center text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;