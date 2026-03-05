import React, { useState, useEffect } from 'react';

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Edit (พร้อมอีเมล)
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ 
      name: '', username: '', email: '', role: '', 
      rank: '', position: '', duty: '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  // State สำหรับ Import (เพิ่มหลายคน)
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // ดึงข้อมูล
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://po-leave-backend.onrender.com/api/users', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ฟังก์ชัน Import CSV
  const handleImportSubmit = async (e) => {
      e.preventDefault();
      if (!importFile) return alert("กรุณาเลือกไฟล์ CSV");

      const formData = new FormData();
      formData.append('file', importFile);

      setIsImporting(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('https://po-leave-backend.onrender.com/api/users/import', {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json' 
              },
              body: formData
          });
          
          const data = await res.json();
          
          if (res.ok) {
              alert(data.message);
              setShowImport(false);
              setImportFile(null);
              fetchUsers(); // รีโหลดข้อมูลใหม่หลัง import
          } else {
              alert("เกิดข้อผิดพลาด: " + (data.message || 'Unknown Error'));
          }
      } catch (err) {
          console.error(err);
          alert("เชื่อมต่อ Server ไม่ได้");
      } finally {
          setIsImporting(false);
      }
  };

  // ฟังก์ชันเตรียมข้อมูล Edit
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditForm({ 
        name: user.name, 
        username: user.username, 
        email: user.email || '', 
        role: user.role, 
        rank: user.rank || '',
        position: user.position || '',
        duty: user.duty || ''
    });
  };

  // บันทึก Edit
  const handleSaveEdit = async (id) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        alert('✅ อัปเดตข้อมูลสำเร็จ!');
        setEditingUser(null);
        fetchUsers();
      } else {
        const errData = await res.json();
        alert('เกิดข้อผิดพลาด: ' + (errData.message || 'ตรวจสอบข้อมูลอีกครั้ง'));
      }
    } catch (err) {
      alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
      setIsSaving(false);
    }
  };

  // ลบ User
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานท่านนี้?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      alert("เชื่อมต่อ Server ไม่ได้");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          👥 ระบบจัดการผู้ใช้งาน
        </h2>
        <div className="flex gap-2">
            {/* นำปุ่ม Import (เพิ่มทีละหลายคน) กลับมา */}
            <button 
                onClick={() => setShowImport(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow font-semibold flex items-center gap-2 transition-transform hover:scale-105"
            >
                📥 Import Excel/CSV
            </button>
        </div>
      </div>

      {/* --- Modal Import --- */}
      {showImport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-pop-in">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-xl font-bold text-gray-800">📥 Import สมาชิกจากไฟล์</h3>
                      <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">×</button>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-sm text-yellow-800">
                      <p className="font-bold mb-2">⚠️ รูปแบบไฟล์ CSV (เรียงตามคอลัมน์):</p>
                      <ul className="list-decimal pl-5 space-y-1">
                          <li>ยศ (เช่น พ.ต.อ.)</li>
                          <li>ชื่อ (เช่น สมชาย)</li>
                          <li>นามสกุล (เช่น ใจดี)</li>
                          <li>ตำแหน่ง (เช่น ผกก.)</li>
                          <li>เบอร์โทร (ใช้เป็น Username)</li>
                          <li>ปฏิบัติหน้าที่ (เช่น สภ.เมือง)</li>
                      </ul>
                      <p className="mt-3 font-bold text-red-600 border-t border-yellow-200 pt-2">* รหัสผ่านจะถูกตั้งเป็น "1" อัตโนมัติ</p>
                  </div>

                  <form onSubmit={handleImportSubmit}>
                      <label className="block mb-2 text-sm font-medium text-gray-900">เลือกไฟล์ CSV</label>
                      <input 
                          type="file" 
                          accept=".csv, .txt"
                          onChange={(e) => setImportFile(e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                      />
                      
                      <div className="mt-6 flex justify-end gap-3">
                          <button 
                            type="button"
                            onClick={() => setShowImport(false)} 
                            className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                          >
                              ยกเลิก
                          </button>
                          <button 
                            type="submit" 
                            disabled={isImporting || !importFile} 
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                          >
                              {isImporting ? '⏳ กำลังนำเข้า...' : 'ยืนยันการ Import'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                <tr>
                <th className="py-3 px-4">ชื่อ-สกุล</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email (รีเซ็ตรหัส)</th>
                <th className="py-3 px-4">ตำแหน่ง</th>
                <th className="py-3 px-4 text-center">สิทธิ์</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
                {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-blue-50 transition-colors">
                    
                    <td className="py-3 px-4 align-middle">
                        {editingUser === user.id ? (
                            <input className="border p-1.5 w-full rounded focus:ring-2 focus:ring-blue-400 outline-none" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                        ) : <span className="font-bold text-gray-700">{user.name}</span>}
                    </td>

                    <td className="py-3 px-4 align-middle">
                        {editingUser === user.id ? (
                            <input className="border p-1.5 w-full rounded focus:ring-2 focus:ring-blue-400 outline-none" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
                        ) : user.username}
                    </td>

                    <td className="py-3 px-4 align-middle">
                        {editingUser === user.id ? (
                            <input className="border p-1.5 w-full rounded focus:ring-2 focus:ring-blue-400 outline-none" type="email" placeholder="email@gmail.com" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                        ) : (user.email || <span className="text-red-400 text-xs italic">ยังไม่มีอีเมล</span>)}
                    </td>

                    <td className="py-3 px-4 align-middle">
                        {editingUser === user.id ? (
                            <input className="border p-1.5 w-full rounded focus:ring-2 focus:ring-blue-400 outline-none" placeholder="ตำแหน่ง" value={editForm.position} onChange={(e) => setEditForm({...editForm, position: e.target.value})} />
                        ) : user.position || '-'}
                    </td>

                    <td className="py-3 px-4 text-center align-middle">
                        {editingUser === user.id ? (
                        <select className="border p-1.5 rounded focus:ring-2 focus:ring-blue-400 outline-none" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {user.role}
                        </span>
                        )}
                    </td>

                    <td className="py-3 px-4 text-center align-middle">
                        {editingUser === user.id ? (
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleSaveEdit(user.id)} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded shadow text-xs font-bold">บันทึก</button>
                            <button onClick={() => setEditingUser(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded shadow text-xs font-bold">ยกเลิก</button>
                        </div>
                        ) : (
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleEditClick(user)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded shadow text-xs font-bold transition transform hover:scale-105">✏️ แก้ไข</button>
                            <button 
                                onClick={() => handleDelete(user.id)} 
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded shadow text-xs font-bold transition transform hover:scale-105"
                                disabled={currentUser?.id === user.id}
                            >
                                🗑️ ลบ
                            </button>
                        </div>
                        )}
                    </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;