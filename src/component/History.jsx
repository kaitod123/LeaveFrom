import React, { useState, useEffect } from 'react';

const History = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isDownloading, setIsDownloading] = useState(null);
  const [publicDuty, setPublicDuty] = useState(null);

  // ตรวจสอบ URL เพื่อหา duty
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dutyParam = params.get('duty');
    if (dutyParam) setPublicDuty(dutyParam);
  }, []);

  // ฟังก์ชันดึงข้อมูล (Smart Switching)
  const fetchLeaves = async (search = '') => {
    setLoading(true);
    try {
      let url;
      let headers = { 'Accept': 'application/json' };

      // ตรวจสอบ URL Param อีกครั้งเพื่อให้แน่ใจ (บางครั้ง State อัปเดตช้ากว่า)
      const params = new URLSearchParams(window.location.search);
      const currentPublicDuty = params.get('duty');

      if (currentPublicDuty) {
        // --- โหมดสาธารณะ (ไม่ต้องใช้ Token) ---
        url = `https://po-leave-backend.onrender.com/api/public/leaves?duty=${encodeURIComponent(currentPublicDuty)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
      } else {
        // --- โหมดสมาชิก (ใช้ Token) ---
        const token = localStorage.getItem('token');
        if (!token) {
            // ถ้าไม่มี Token และไม่ใช่ Public -> หยุดทำงาน (รอ Redirect ที่ App.jsx)
            setLoading(false);
            return; 
        }
        headers['Authorization'] = `Bearer ${token}`;
        url = search 
          ? `https://po-leave-backend.onrender.com/api/leave-request?search=${encodeURIComponent(search)}`
          : 'https://po-leave-backend.onrender.com/api/leave-request';
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
        setSelectedIds([]); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ Component Mount หรือ publicDuty เปลี่ยน
  useEffect(() => {
    fetchLeaves();
  }, [publicDuty]);

  // Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchLeaves(searchTerm), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- ฟังก์ชันจัดการต่างๆ (จะทำงานเฉพาะตอนมี Token/Admin) ---
  const toggleSelectAll = () => {
    if (selectedIds.length === leaves.length && leaves.length > 0) setSelectedIds([]);
    else setSelectedIds(leaves.map(l => l.id));
  };

  const toggleSelectItem = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDownloadWord = async (id) => {
    if (publicDuty) return; // Public โหลดไม่ได้
    setIsDownloading(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/leave-request/${id}/word`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Leave_${id}.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } else {
          alert("ไม่สามารถดาวน์โหลดได้");
      }
    } catch (err) { alert("เชื่อมต่อ Server ไม่ได้"); } 
    finally { setIsDownloading(null); }
  };

  const handleDelete = async (id) => {
    if (publicDuty) return;
    if (!window.confirm("ยืนยันการลบ?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/leave-request/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
          setLeaves(prev => prev.filter(l => l.id !== id));
          alert('ลบสำเร็จ');
      }
    } catch (err) { alert('Error'); }
  };

  const handleBulkDelete = async () => {
    if (publicDuty) return;
    if (!window.confirm(`ยืนยันลบ ${selectedIds.length} รายการ?`)) return;
    setIsDeletingBulk(true);
    const token = localStorage.getItem('token');
    try {
      for (const id of selectedIds) {
        await fetch(`https://po-leave-backend.onrender.com/api/leave-request/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
      }
      fetchLeaves(searchTerm);
      alert('ลบสำเร็จ');
    } catch (err) { alert('Error'); }
    finally { setIsDeletingBulk(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (status) => {
      switch(status) {
          case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200">✅ อนุมัติ</span>;
          case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs border border-red-200">❌ ไม่อนุมัติ</span>;
          default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs border border-yellow-200">⏳ รออนุมัติ</span>;
      }
  };

  // ตรวจสอบสิทธิ์ (Public Mode ห้ามจัดการ)
  const canManage = !publicDuty && user?.role === 'admin';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden font-sarabun">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             {publicDuty ? `📂 ประวัติการลา - ${publicDuty}` : `📜 ประวัติการลา ${user?.role === 'admin' ? '(Admin)' : ''}`}
          </h2>
          <p className="text-gray-500 text-sm">
            {publicDuty ? 'รายการลาของหน่วยงาน (มุมมองสาธารณะ)' : 'จัดการและตรวจสอบข้อมูลการลา'}
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            {canManage && selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} disabled={isDeletingBulk} className="bg-red-600 text-white px-3 py-2 rounded shadow text-sm font-bold animate-pulse">
                    {isDeletingBulk ? '...' : `ลบ ${selectedIds.length} รายการ`}
                </button>
            )}
            <input 
              type="text" 
              className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="🔍 ค้นหาชื่อ..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-gray-600 uppercase text-xs font-bold border-b">
            <tr>
              {canManage && (
                <th className="py-3 px-4 text-center w-10">
                  <input type="checkbox" checked={leaves.length > 0 && selectedIds.length === leaves.length} onChange={toggleSelectAll} />
                </th>
              )}
              <th className="py-3 px-4">ชื่อ-นามสกุล</th>
              <th className="py-3 px-4 text-center">ประเภท</th>
              <th className="py-3 px-4">รายละเอียด</th>
              <th className="py-3 px-4 text-center">วันที่ลา</th>
              <th className="py-3 px-4 text-center">สถานะ</th>
              <th className="py-3 px-4 text-center">เอกสาร</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {loading ? <tr><td colSpan="7" className="text-center py-8">กำลังโหลด...</td></tr> : 
             leaves.length === 0 ? <tr><td colSpan="7" className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr> :
             leaves.map((leave) => (
              <tr key={leave.id} className="border-b hover:bg-gray-50">
                {canManage && (
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" checked={selectedIds.includes(leave.id)} onChange={() => toggleSelectItem(leave.id)} />
                  </td>
                )}
                <td className="py-3 px-4 font-bold text-gray-700">{leave.fullname}</td>
                <td className="py-3 px-4 text-center"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">{leave.leave_type}</span></td>
                <td className="py-3 px-4 text-xs max-w-xs truncate">{leave.duty || leave.reason}</td>
                <td className="py-3 px-4 text-center text-xs whitespace-nowrap">{formatDate(leave.start_date)}</td>
                <td className="py-3 px-4 text-center">{getStatusBadge(leave.status)}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    {leave.pdf_path && (
                        <a href={`https://po-leave-backend.onrender.com/storage/${leave.pdf_path}`} target="_blank" className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-200">PDF</a>
                    )}
                    {canManage && (
                        <>
                          <button onClick={() => handleDownloadWord(leave.id)} disabled={isDownloading === leave.id} className="text-blue-500 bg-white border border-blue-200 px-2 py-1 rounded text-xs">
                              {isDownloading === leave.id ? '...' : 'Word'}
                          </button>
                          <button onClick={() => handleDelete(leave.id)} className="text-red-500 bg-white border border-red-200 px-2 py-1 rounded text-xs">ลบ</button>
                        </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;