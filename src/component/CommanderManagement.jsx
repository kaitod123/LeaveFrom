import React, { useState, useEffect } from 'react';

const CommanderManagement = () => {
  const [commanders, setCommanders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const defaultForm = {
    id: null,
    key_match: '',
    cmd_rank: 'ร.ต.อ.',
    cmd_name: '',
    cmd_position: 'รอง สวป.สภ.เมืองนครราชสีมา',
    sup_rank: 'พ.ต.อ.',
    sup_name: 'ศิริชัย ศรีชัยปัญญา',
    sup_position: 'ผกก.สภ.เมืองนครราชสีมา'
  };
  
  const [formData, setFormData] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCommanders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://po-leave-backend.onrender.com/api/commanders', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setCommanders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommanders();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (cmd) => {
    setFormData(cmd);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');

      // ตรวจสอบว่าเป็นการ "แก้ไข(PUT)" หรือ "เพิ่มใหม่(POST)"
      const isEdit = formData.id !== null;
      const url = isEdit 
          ? `https://po-leave-backend.onrender.com/api/commanders/${formData.id}` 
          : 'https://po-leave-backend.onrender.com/api/commanders';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('✅ บันทึกข้อมูลสำเร็จ!');
        setIsModalOpen(false);
        fetchCommanders();
      } else {
        // ดึงข้อความ Error เชิงลึกมาแสดงให้ชัดเจน
        let errorMsg = data.message || 'ข้อมูลผิดพลาด หรือชื่อชุดนี้มีอยู่แล้ว';
        if (data.errors) {
            errorMsg = Object.values(data.errors).flat().join('\n');
        }
        alert('❌ เกิดข้อผิดพลาด:\n' + errorMsg);
      }
    } catch (err) {
      alert('❌ ไม่สามารถเชื่อมต่อ Server ได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ ยืนยันการลบข้อมูลสายการบังคับบัญชานี้?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://po-leave-backend.onrender.com/api/commanders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        fetchCommanders();
      }
    } catch (err) {
      alert("ไม่สามารถลบข้อมูลได้");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sarabun">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              👔 จัดการรายชื่อผู้บังคับบัญชา
            </h2>
            <p className="text-gray-500 text-sm mt-1">กำหนดสายการบังคับบัญชาเพื่อนำไปแสดงในใบลาอัตโนมัติ</p>
        </div>
        <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md font-bold flex items-center gap-2 transition"
        >
            ➕ เพิ่มสายการบังคับบัญชา
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm font-bold border-b border-gray-200">
                <tr>
                <th className="py-3 px-4">ชื่อชุด / หน้าที่</th>
                <th className="py-3 px-4">ผู้พิจารณาชั้นต้น (ผู้เสนอ)</th>
                <th className="py-3 px-4">ผู้บังคับบัญชา (ผู้อนุมัติ)</th>
                <th className="py-3 px-4 text-center w-40">จัดการ</th>
                </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
                {loading ? (
                    <tr><td colSpan="4" className="text-center py-8">⏳ กำลังโหลดข้อมูล...</td></tr>
                ) : commanders.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-red-500">❌ ไม่พบข้อมูลในระบบ</td></tr>
                ) : (
                    commanders.map((cmd) => (
                        <tr key={cmd.id} className="border-b hover:bg-blue-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-blue-700">📌 {cmd.key_match}</td>
                            <td className="py-3 px-4">
                                <div className="font-bold text-gray-800">{cmd.cmd_rank} {cmd.cmd_name}</div>
                                <div className="text-xs text-gray-500">{cmd.cmd_position}</div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="font-bold text-gray-800">{cmd.sup_rank} {cmd.sup_name}</div>
                                <div className="text-xs text-gray-500">{cmd.sup_position}</div>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => handleEdit(cmd)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded shadow text-xs font-bold transition">✏️ แก้ไข</button>
                                    <button onClick={() => handleDelete(cmd.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded shadow text-xs font-bold transition">🗑️ ลบ</button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-pop-in">
                  <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold text-lg">{formData.id ? '✏️ แก้ไขข้อมูลสายการบังคับบัญชา' : '➕ เพิ่มสายการบังคับบัญชา'}</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-red-300 text-2xl leading-none">&times;</button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                              ชื่อชุด / ชื่อหน้าที่ <span className="text-red-500">*</span> 
                              <span className="font-normal text-xs text-gray-500 ml-2">(ต้องพิมพ์ให้ตรงกับตัวเลือกในฟอร์มลา เช่น "สายตรวจชุดที่ ๒")</span>
                          </label>
                          <input 
                            required 
                            name="key_match" 
                            value={formData.key_match} 
                            onChange={handleChange} 
                            // เพิ่มเงื่อนไขถ้ากำลังแก้ไขอยู่ จะไม่ให้เปลี่ยนชื่อชุดได้ ป้องกันการชนกัน
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${formData.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                            placeholder="เช่น สายตรวจชุดที่ ๒" 
                            disabled={formData.id !== null}
                          />
                          {formData.id && <p className="text-xs text-red-500 mt-1">* ไม่สามารถแก้ไขชื่อชุดได้ หากต้องการเปลี่ยนชื่อชุด กรุณาลบและสร้างใหม่</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="space-y-3">
                              <h4 className="font-bold text-blue-800 border-b border-gray-300 pb-1">ผู้พิจารณาชั้นต้น (ผู้เสนอ)</h4>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ยศ</label>
                                  <input name="cmd_rank" value={formData.cmd_rank} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none" placeholder="เช่น ร.ต.อ." />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                  <input required name="cmd_name" value={formData.cmd_name} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น รดิศ ศิริวรรณ" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ตำแหน่ง</label>
                                  <input name="cmd_position" value={formData.cmd_position} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none" placeholder="เช่น รอง สวป.สภ.เมืองนครราชสีมา" />
                              </div>
                          </div>

                          <div className="space-y-3">
                              <h4 className="font-bold text-purple-800 border-b border-gray-300 pb-1">ผู้พิจารณาอนุมัติ (ผกก.)</h4>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ยศ</label>
                                  <input name="sup_rank" value={formData.sup_rank} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none" placeholder="เช่น พ.ต.อ." />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                                  <input name="sup_name" value={formData.sup_name} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">ตำแหน่ง</label>
                                  <input name="sup_position" value={formData.sup_position} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none" />
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500">ยกเลิก</button>
                          <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">
                              {isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <style>{`
        @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CommanderManagement;