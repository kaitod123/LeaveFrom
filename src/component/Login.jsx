import React, { useState } from 'react';

const Login = ({ onLogin, onForgot }) => { 
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. แก้ไขให้ใช้ setForm และดึงค่าจาก form ให้ถูกต้อง
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const res = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json' // 2. สำคัญมาก! ต้องใส่บรรทัดนี้เพื่อไม่ให้เกิด CORS Redirect
            },
            body: JSON.stringify(form)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.user);
        } else {
            // แสดงข้อความ Error จาก API 
            setError(data.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (err) {
        setError("ไม่สามารถเชื่อมต่อ Server ได้ (ตรวจสอบว่า php artisan serve รันอยู่หรือไม่)");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-2 text-center text-blue-600">เข้าสู่ระบบ</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">ระบบภายในองค์กร (Authorized Only)</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
            <input 
              name="username"
              type="text" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="Username"
              onChange={handleChange} // 3. เปลี่ยนมาเรียกใช้ handleChange 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">รหัสผ่าน</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="Password"
              onChange={handleChange} // 3. เปลี่ยนมาเรียกใช้ handleChange 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg transform active:scale-95 disabled:bg-gray-400"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <div className="pt-4 border-t border-gray-100 text-center">
            <button 
              type="button"
              onClick={onForgot}
              className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors"
            >
              ลืมรหัสผ่านใช่หรือไม่?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;