import React, { useState, useEffect } from 'react';

const ApproveLeave = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // รายการยศเพื่อใช้แยกออกจากชื่อ
  const ranks = ["พล.ต.ท.", "พล.ต.ต.", "พ.ต.อ.", "พ.ต.ท.", "พ.ต.ต.", "ร.ต.อ.", "ร.ต.ท.", "ร.ต.ต.", "ด.ต.", "จ.ส.ต.", "ส.ต.อ.", "ส.ต.ท.", "ส.ต.ต."];

  const separateRankAndName = (fullname) => {
    if (!fullname) return { rank: '', name: '' };
    for (const rank of ranks) {
      if (fullname.startsWith(rank)) {
        return { rank: rank, name: fullname.substring(rank.length).trim() };
      }
    }
    return { rank: '', name: fullname };
  };

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://po-leave-backend.onrender.com/api/leave-request', {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const processed = data.filter(i => i.status === 'pending').map(item => {
          const { rank, name } = separateRankAndName(item.fullname);
          return { ...item, displayRank: rank, displayName: name };
        });
        setLeaves(processed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingLeaves(); }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`ยืนยันการ${status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/leave-request/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert('ดำเนินการสำเร็จ');
        setLeaves(leaves.filter(item => item.id !== id));
      }
    } catch (err) { alert('ผิดพลาด'); }
  };

  const handleFileUpload = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/leave-request/${id}/upload-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData
      });
      if (res.ok) { alert('อัปโหลด PDF สำเร็จ'); } else { alert('ล้มเหลว'); }
    } catch (err) { alert('อัปโหลดล้มเหลว'); }
  };

  const filtered = leaves.filter(item => item.fullname.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 font-sarabun bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">📋 รายการรออนุมัติ</h2>
          <input 
            type="text" placeholder="🔍 ค้นชื่อ..." 
            className="border p-2 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {loading ? <div className="text-center py-10">กำลังโหลด...</div> : filtered.length === 0 ? <div className="text-center py-10 text-gray-400">ไม่มีรายการรออนุมัติ</div> : filtered.map(item => (
            <div key={item.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
              <div className="mb-3 md:mb-0">
                <div className="flex items-center gap-2">
                  {item.displayRank && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">{item.displayRank}</span>}
                  <span className="font-bold text-gray-800">{item.displayName}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="text-blue-600 font-bold">{item.leave_type}</span> | {item.start_date} - {item.end_date}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateStatus(item.id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-green-600">อนุมัติ</button>
                <button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-red-600">ไม่อนุมัติ</button>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-700">
                  📄 PDF <input type="file" className="hidden" accept="application/pdf" onChange={(e) => handleFileUpload(item.id, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApproveLeave;