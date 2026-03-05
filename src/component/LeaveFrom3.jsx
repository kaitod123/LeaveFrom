import React, { useState, useEffect, useRef } from 'react';

const LeaveForm3 = ({ user, type }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    rank: '',
    position: '',
    affiliation: 'สภ.เมืองนครราชสีมา',
    duty: '',
    phone: '',
    leaveType: 'ลาป่วย',
    startDate: '',
    endDate: '',
    totalDays: '0',
    accumulatedDays: '0',
    leaveRight: '30',
    reason: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaderPreview, setLeaderPreview] = useState(null);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/api/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data);
          setFilteredUsers(data);
        }
      } catch (err) {
        console.error("Connection Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm) {
        setFilteredUsers(usersList);
    } else {
        const lowerTerm = searchTerm.toLowerCase();
        const results = usersList.filter(u => 
            (u.name && u.name.toLowerCase().includes(lowerTerm)) ||
            (u.rank && u.rank.toLowerCase().includes(lowerTerm)) ||
            (u.username && u.username.includes(lowerTerm))
        );
        setFilteredUsers(results);
    }
  }, [searchTerm, usersList]);

  useEffect(() => {
    const fetchLeader = async () => {
      if (!formData.duty) {
         setLeaderPreview(null);
         return;
      }
      try {
         const token = localStorage.getItem('token');
         const res = await fetch(`http://127.0.0.1:8000/api/leader-info?match=${encodeURIComponent(formData.duty)}`, {
           headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
         });
         if (res.ok) {
           const data = await res.json();
           setLeaderPreview(data);
         } else {
           setLeaderPreview(null);
         }
      } catch (err) {
         console.error("Leader fetch error:", err);
      }
    };

    const timeoutId = setTimeout(() => fetchLeader(), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.duty]);

  const handleSelectUser = (selectedUser) => {
    let cleanName = selectedUser.name || '';
    const userRank = selectedUser.rank || '';
    if (userRank && cleanName.startsWith(userRank)) {
        cleanName = cleanName.substring(userRank.length).trim();
    }

    setFormData(prev => ({
        ...prev,
        fullname: cleanName,
        rank: userRank,
        position: selectedUser.position || '',
        duty: selectedUser.duty || '',
        phone: selectedUser.phone || selectedUser.username || '',
        affiliation: 'สภ.เมืองนครราชสีมา'
    }));
    setSearchTerm(`${userRank} ${cleanName}`);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        setFormData(prev => ({ ...prev, totalDays: diffDays.toString() }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert("กรุณา Login ใหม่");
    if (!formData.fullname) return alert("⚠️ กรุณาระบุชื่อผู้ลา");

    if (!formData.startDate || !formData.endDate) {
        return alert("⚠️ กรุณาระบุวันลา (ตั้งแต่วันที่ และ ถึงวันที่) ให้ครบถ้วน");
    }

    setIsSubmitting(true);
    try {
        const payload = {
            ...formData,
            createDate: new Date().toISOString().slice(0, 10),
            cmonth: new Date().toISOString().slice(0, 10),
            leaveType: formData.leaveType
        };

        const res = await fetch('http://127.0.0.1:8000/api/leave-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
            alert("✅ บันทึกคำขอลาป่วยสำเร็จ!");
            if (result.downloadUrl) window.open(result.downloadUrl, '_blank');
        } else {
            alert("❌ เกิดข้อผิดพลาด: " + (result.message || 'Unknown error'));
        }
    } catch (err) {
        alert("เชื่อมต่อ Server ไม่ได้");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 flex justify-center bg-gray-50 font-sarabun">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden mx-auto border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-500 p-8 text-white shadow-inner">
          <div className="flex items-center gap-4">
            <span className="text-5xl drop-shadow-md">🤒</span>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">บันทึกคำขอลาป่วย / ลาคลอด</h2>
              <p className="text-rose-100 text-sm mt-1 font-medium">ค้นหาและดึงข้อมูลข้าราชการตำรวจจากฐานข้อมูล</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          
          {/* Search Section */}
          <div className="relative mb-10" ref={dropdownRef}>
            <label className="block font-bold mb-2 text-gray-700 text-sm uppercase tracking-wide">🔍 ค้นหารายชื่อ (พิมพ์เพื่อค้นหา)</label>
            <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400 text-lg">🔎</span>
                <input 
                    type="text" 
                    className="w-full py-3.5 pr-4 pl-12 border-2 border-gray-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 shadow-sm"
                    placeholder="พิมพ์ชื่อ, ยศ หรือเบอร์โทรศัพท์..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                />
            </div>

            {isDropdownOpen && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-2xl z-50 max-h-64 overflow-y-auto list-none p-0 divide-y divide-gray-100">
                    {isLoading ? (
                        <li className="p-5 text-center text-gray-500 font-medium animate-pulse">⏳ กำลังโหลดข้อมูล...</li>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                            <li key={u.id} className="p-4 cursor-pointer hover:bg-rose-50 transition-colors group" onClick={() => handleSelectUser(u)}>
                                <span className="block font-bold text-gray-800 group-hover:text-rose-700">{u.rank} {u.name}</span>
                                <span className="block text-xs text-gray-500 mt-1">📌 {u.position} &nbsp;|&nbsp; 👮 {u.duty}</span>
                            </li>
                        ))
                    ) : (
                        <li className="p-5 text-center text-red-500 font-medium">❌ ไม่พบรายชื่อที่ค้นหา</li>
                    )}
                </ul>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
             <div className="h-px bg-gray-200 flex-1"></div>
             <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">ข้อมูลผู้ลา (ดึงอัตโนมัติ)</span>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">ยศ</label>
                <input name="rank" className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-50 text-rose-700 font-bold cursor-not-allowed" value={formData.rank} onChange={handleChange} placeholder="ยศ" readOnly />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">ชื่อ-นามสกุล</label>
                <input name="fullname" className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-50 text-gray-600 font-medium cursor-not-allowed" value={formData.fullname} onChange={handleChange} placeholder="ชื่อ-สกุล" readOnly />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">ตำแหน่ง</label>
                <input name="position" className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-50 text-gray-600 font-medium cursor-not-allowed" value={formData.position} onChange={handleChange} placeholder="ตำแหน่ง" readOnly />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">สังกัด</label>
                <input name="affiliation" className="w-full p-3.5 border border-gray-200 rounded-xl outline-none bg-gray-50 text-gray-600 font-medium cursor-not-allowed" readOnly value={formData.affiliation} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-2">ปฏิบัติหน้าที่</label>
                <input 
                    name="duty" 
                    className="w-full p-3.5 border-2 border-rose-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" 
                    value={formData.duty} 
                    onChange={handleChange} 
                    placeholder="เช่น สายตรวจชุดที่ ๒ (สามารถพิมพ์แก้ไขได้)" 
                />
                
                {leaderPreview && leaderPreview.cmd_name && leaderPreview.cmd_name !== '..........................' && (
                    <div className="mt-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-800 flex items-start gap-3 shadow-sm">
                        <span className="text-xl">👤</span>
                        <div>
                            <strong className="block mb-0.5 text-rose-900">เสนอต่อ (ผู้พิจารณาคำขอ):</strong> 
                            {leaderPreview.cmd_rank} {leaderPreview.cmd_name} <br/>
                            <span className="text-xs opacity-80 font-medium">ตำแหน่ง: {leaderPreview.cmd_position}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-2">เบอร์โทรศัพท์ (ติดต่อระหว่างลา)</label>
                <input name="phone" className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" value={formData.phone} onChange={handleChange} placeholder="เบอร์โทรศัพท์..." />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
             <div className="h-px bg-gray-200 flex-1"></div>
             <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">📅 กำหนดการลา</span>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">ลาตั้งแต่วันที่ <span className="text-red-500">*</span></label>
                <input type="date" name="startDate" className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" onChange={handleChange} />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">ถึงวันที่ <span className="text-red-500">*</span></label>
                <input type="date" name="endDate" className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" onChange={handleChange} />
             </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-2">รวม (วัน)</label>
                <input type="text" className="w-full p-3.5 border-2 border-rose-200 rounded-xl outline-none bg-rose-50 text-rose-700 font-extrabold text-center text-xl cursor-not-allowed" value={formData.totalDays} readOnly />
             </div>

             <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 mb-2">เหตุผลการลาป่วย</label>
                <textarea name="reason" rows="3" className="w-full p-3.5 border-2 border-gray-200 rounded-xl outline-none transition-all text-gray-700 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20" placeholder="ระบุอาการป่วย หรือสาเหตุการลา..." onChange={handleChange}></textarea>
             </div>
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full p-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl mt-8 transition-all shadow-lg hover:shadow-rose-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-lg flex justify-center items-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึกข้อมูล...
              </>
            ) : '💾 บันทึกและสร้างใบลา'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default LeaveForm3;