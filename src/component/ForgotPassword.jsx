import React, { useState } from 'react';

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [resetLink, setResetLink] = useState(''); // เก็บลิงก์ที่ได้จากเซิร์ฟเวอร์

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        setResetLink('');

        try {
           const res = await fetch('https://po-leave-backend.onrender.com/api/forgot-password', {
            method: 'POST',
                headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok) {
                // เซ็ตข้อความสำเร็จ และเก็บลิงก์ไว้แสดงผล
                setMessage({ text: data.message, type: 'success' });
                setResetLink(data.reset_link); 
            } else {
                setMessage({ text: data.message || 'ไม่พบอีเมลนี้ในระบบ', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sarabun">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">🔐 ลืมรหัสผ่าน?</h2>
                
                {/* ถ้ายังไม่ได้ลิงก์ ให้แสดงฟอร์มกรอกอีเมล */}
                {!resetLink ? (
                    <>
                        <p className="text-gray-600 text-center mb-6 text-sm">
                            กรุณากรอกอีเมลที่ลงทะเบียนไว้ ระบบจะสร้างลิงก์สำหรับเปลี่ยนรหัสผ่านให้ท่านทันที
                        </p>
                        
                        <form onSubmit={handleSendEmail} className="space-y-4">
                            <input 
                                type="email" 
                                required 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button 
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
                            >
                                {loading ? '⏳ กำลังตรวจสอบข้อมูล...' : '🔗 สร้างลิงก์รีเซ็ตรหัสผ่าน'}
                            </button>
                        </form>
                    </>
                ) : (
                    /* ถ้าได้ลิงก์แล้ว ให้แสดงปุ่มกดไปตั้งรหัสผ่านใหม่แทน */
                    <div className="text-center space-y-4 py-4 animate-fade-in">
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 mb-4 font-bold">
                            {message.text}
                        </div>
                        <p className="text-sm text-gray-600">กรุณากดปุ่มด้านล่างเพื่อไปยังหน้ากำหนดรหัสผ่านใหม่</p>
                        <a 
                            href={resetLink}
                            className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md"
                        >
                            🎯 คลิกที่นี่เพื่อเปลี่ยนรหัสผ่าน
                        </a>
                    </div>
                )}

                {/* ข้อความ Error (ถ้ามี) */}
                {message.text && !resetLink && (
                    <div className={`mt-4 p-3 rounded text-center text-sm font-bold ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button onClick={onBack} className="w-full mt-6 text-gray-500 hover:text-blue-600 hover:underline text-sm font-bold transition">
                    ← กลับสู่หน้าเข้าสู่ระบบ
                </button>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;