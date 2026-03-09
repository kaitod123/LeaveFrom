import React, { useState, useEffect } from 'react';

// Import Component
import Login from './component/Login.jsx';
import AdminLeaveForm from './component/AdminLeaveFrom.jsx';
import LeaveForm from './component/LeaveFrom.jsx';
import LeaveForm2 from './component/LeaveFrom2.jsx';
import LeaveForm3 from './component/LeaveFrom3.jsx';
import Register from './component/Register.jsx';
import History from './component/History.jsx';
import UserManagement from './component/UserManagement.jsx';
import ApproveLeave from './component/ApproveLeave.jsx';
import LeaveCalendar from './component/LeaveCalendar.jsx';
import CommanderManagement from './component/CommanderManagement.jsx';
// Import หน้าลืมรหัสผ่าน
import ForgotPassword from './component/ForgotPassword.jsx';
import ResetPassword from './component/ResetPassword.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('history');
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  // ตรวจสอบ URL parameter สำหรับโหมดสาธารณะ
  const queryParams = new URLSearchParams(window.location.search);
  const publicDuty = queryParams.get('duty');
  
  // ตรวจสอบ URL ว่าอยู่ในหน้ารีเซ็ตรหัสหรือไม่
  const isResetting = window.location.pathname === '/reset-password';

  // ✅ แก้ไข: ต้องย้าย useEffect มาไว้ "ด้านบนสุด" ก่อนที่จะมีการใช้คำสั่ง if (...) return
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('sick');
    
    // หากอยู่ในโหมด Public แล้วกดออก ให้ล้าง URL กลับหน้าแรก
    if (publicDuty) {
        window.history.pushState({}, document.title, "/");
        window.location.reload();
    }
  };

  // --- 1. ตรวจสอบโหมดรีเซ็ตรหัสผ่าน ---
  if (isResetting) {
      return <ResetPassword />;
  }

  // --- 2. ตรวจสอบโหมดสาธารณะ (Public) เป็นอันดับแรก ---
  // หากมีลิงก์ ?duty=... ให้แสดงหน้าประวัติทันที โดยไม่ต้อง Login
  if (publicDuty) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
           {/* Header สำหรับโหมดสาธารณะ */}
           <div className="flex justify-between items-center mb-6 px-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div>
                <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  👮‍♂️ POLICE LEAVE SYSTEM
                </h1>
                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md mt-1 inline-block">
                  โหมดสาธารณะ: {publicDuty}
                </span>
              </div>
              
              <a href="/" className="text-sm text-gray-500 hover:text-blue-600 font-medium hover:underline flex items-center gap-1 transition-colors">
                 <span>เข้าสู่ระบบเจ้าหน้าที่</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
           </div>
           
           {/* แสดงหน้าประวัติ (ส่ง user=null เพื่อบอกว่าเป็น Guest) */}
           <History user={null} />
        </div>
      </div>
    );
  }

  // --- 3. ถ้าไม่มีลิงก์ และยังไม่ Login ให้แสดงหน้า Login หรือ Forgot Password ---
  if (!user) {
    if (isForgotMode) {
        return <ForgotPassword onBack={() => setIsForgotMode(false)} />;
    }
    return <Login onLogin={(u) => setUser(u)} onForgot={() => setIsForgotMode(true)} />;
  }

  // --- 4. ถ้า Login แล้ว ให้แสดงหน้า Dashboard ปกติ ---
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* Sidebar เมนู */}
      <aside className="w-64 bg-white shadow-lg fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">POLICE LEAVE</h1>
          <p className="text-xs text-gray-400 mt-1">ระบบลาพักผ่อนออนไลน์</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">เมนูหลัก</div>

          <NavButton active={currentPage === 'history'} onClick={() => setCurrentPage('history')} icon="📜" label="ประวัติการลา" />
            <NavButton active={currentPage === 'calendar'} onClick={() => setCurrentPage('calendar')} icon="📅" label="ปฏิทินการลา" />
              

          {/* เมนูเฉพาะ Admin */}
          {user?.role === 'admin' && (
            <>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-6">ผู้ดูแลระบบ</div>
                        <NavButton active={currentPage === 'sick'} onClick={() => setCurrentPage('sick')} icon="🏖️" label="ลาพักผ่อน" />
          <NavButton active={currentPage === 'personal'} onClick={() => setCurrentPage('personal')} icon="💼" label="ลากิจ" />
          <NavButton active={currentPage === 'vacation'} onClick={() => setCurrentPage('vacation')} icon="🤒" label="ลาป่วย/คลอด" />
              <NavButton active={currentPage === 'sickadmin'} onClick={() => setCurrentPage('sickadmin')} icon="👮" label="ลาแทนเจ้าหน้าที่" />
              <NavButton active={currentPage === 'ApproveLeave'} onClick={() => setCurrentPage('ApproveLeave')} icon="📋" label="อนุมัติคำขอ" />
              <NavButton active={currentPage === 'UserManagement'} onClick={() => setCurrentPage('UserManagement')} icon="👥" label="จัดการสมาชิก" />
              <NavButton active={currentPage === 'add_member'} onClick={() => setCurrentPage('add_member')} icon="➕" label="เพิ่มสมาชิกรายบุคคล" />
                <NavButton active={currentPage === 'commanders'} onClick={() => setCurrentPage('commanders')} icon="👔" label="จัดการผู้บังคับบัญชา" />
            </>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user.name ? user.name.charAt(0) : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-sm font-bold shadow-sm hover:shadow">
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:ml-64 print-section">
        <div className="max-w-5xl mx-auto">
          {currentPage === 'sick' && <LeaveForm user={user} type="ลาพักผ่อน" />}
          {currentPage === 'personal' && <LeaveForm2 user={user} type="ลากิจ" />}
          {currentPage === 'vacation' && <LeaveForm3 user={user} type="ลาป่วย" />}
          {currentPage === 'sickadmin' && <AdminLeaveForm user={user} type="ลาพักผ่อน" />}
          
          {currentPage === 'history' && <History user={user} />}
          {currentPage === 'UserManagement' && <UserManagement user={user} />}
          {currentPage === 'ApproveLeave' && <ApproveLeave user={user} />}
          {currentPage === 'add_member' && <Register onBack={() => setCurrentPage('history')} isInternal={true} />}
          {currentPage === 'calendar' && <LeaveCalendar />}
          {currentPage === 'commanders' && <CommanderManagement user={user}/>}
        </div>
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
      active 
      ? 'bg-blue-50 text-blue-600 font-bold shadow-sm ring-1 ring-blue-100' 
      : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default App;