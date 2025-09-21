// OwnerDashboardPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OwnerStatusPage from "./OwnerStatusPage";
import OwnerApprovedDormsPage from "./OwnerApprovedDormsPage";

const API = process.env.REACT_APP_API;

const OwnerDashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState('mydorms');
  const navigate = useNavigate();
  const [dorms, setDorms] = useState([]);
  const [editingDorm, setEditingDorm] = useState(null);
  const [form, setForm] = useState({
  dormname: '',
  address: '',
  facilities: [],
  facilitiesOther: '',
  security: [],
  securityOther: '',
  lat: '',
  long: '',
  rooms: [] 
});
  const [showAddModal, setShowAddModal] = useState(false);
const [addForm, setAddForm] = useState({
  dormname: '',
  address: '',
  facilities: [],
  facilitiesOther: '',
  security: [],
  securityOther: '',
  lat: '',
  long: '',
  rooms: [] 
});

  const approvedDormsRef = useRef(null);

  const [uploadingDorm, setUploadingDorm] = useState(null);
  const [selectedImages, setSelectedImages] = useState(null);

  const [viewDorm, setViewDorm] = useState(null);

  const [dormImages, setDormImages] = useState([]);
  const [viewingDorm, setViewingDorm] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null); // Lightbox

  const facilityOptions = ['Wi-Fi', 'เครื่องซักผ้า', 'ที่จอดรถ', 'ร้านค้า', 'อื่นๆ'];
  const securityOptions = ['กล้องวงจรปิด', 'รปภ.', 'คีย์การ์ด', 'ประตูล็อก 2 ชั้น', 'อื่นๆ'];

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.userid;

  useEffect(() => {
    if (activeMenu === 'mydorms' && userId) {
      axios.get(`${API}/dormitories/mine/${userId}`)
        .then(res => setDorms(res.data))
        .catch(err => console.error('Error loading dorms:', err));
    }
  }, [activeMenu, userId]);

const renderArray = (field) => {
  try {
    if (!field) return 'ไม่มีข้อมูล';

    if (Array.isArray(field)) {
      if (field.length === 0) return 'ไม่มีข้อมูล';

      return field.map(item => {
        if (!item) return null;

        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          // ถ้าเป็น object ว่าง {}
          if (Object.keys(item).length === 0) return null;

          // ดึงค่าตัวแรกของ object
          return Object.values(item)[0];
        }
        return String(item);
      }).filter(Boolean).join(', ') || 'ไม่มีข้อมูล';
    }

    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) return 'ไม่มีข้อมูล';

          return parsed.map(item => {
            if (!item) return null;
            if (typeof item === 'string') return item;
            if (typeof item === 'object') {
              if (Object.keys(item).length === 0) return null;
              return Object.values(item)[0];
            }
            return String(item);
          }).filter(Boolean).join(', ') || 'ไม่มีข้อมูล';
        }
        return parsed ? String(parsed) : 'ไม่มีข้อมูล';
      } catch {
        return field.trim() !== '' ? field : 'ไม่มีข้อมูล';
      }
    }

    if (typeof field === 'object') {
      if (Object.keys(field).length === 0) return 'ไม่มีข้อมูล';
      return Object.values(field).join(', ');
    }

    return String(field);
  } catch {
    return 'ไม่มีข้อมูล';
  }
};



const handleView = async (dorm) => {
  try {
    const res = await axios.get(`${API}/images/${dorm.dormid}`);
    setDormImages(res.data);
    setViewDorm(dorm); // เปิด modal พร้อมข้อมูลและรูป
  } catch (err) {
    console.error('Error fetching images:', err);
    setDormImages([]); // ถ้าโหลดไม่สำเร็จ ก็เซ็ตว่าง
    setViewDorm(dorm);
  }
};



// ===== handleEdit =====
const handleEdit = async (dorm) => {
  let facilitiesList = dorm.facilities;
  let securityList = dorm.security;

  try {
    if (typeof facilitiesList === 'string') facilitiesList = JSON.parse(facilitiesList);
    if (typeof securityList === 'string') securityList = JSON.parse(securityList);
  } catch (err) {
    console.warn('ไม่สามารถแปลงข้อมูล JSON ได้:', err);
  }

  const selectedFacilities = Array.isArray(facilitiesList)
    ? facilitiesList.filter((f) => facilityOptions.includes(f))
    : [];
  const otherFacilities = Array.isArray(facilitiesList)
    ? facilitiesList.filter((f) => !facilityOptions.includes(f))
    : [];

  const selectedSecurity = Array.isArray(securityList)
    ? securityList.filter((s) => securityOptions.includes(s))
    : [];
  const otherSecurity = Array.isArray(securityList)
    ? securityList.filter((s) => !securityOptions.includes(s))
    : [];

  setEditingDorm(dorm);
setForm({
  dormname: dorm.dormname,
  address: dorm.address,
  facilities: selectedFacilities,
  facilitiesOther: otherFacilities.join(', '),
  security: selectedSecurity,
  securityOther: otherSecurity.join(', '),
  lat: dorm.lat || '',
  long: dorm.long || '',
  rooms: dorm.rooms || []   // ✅ เพิ่ม rooms เข้ามาด้วย
});


  // โหลดรูปภาพ
  try {
    const res = await axios.get(`${API}/images/${dorm.dormid}`);
    setDormImages(res.data);
  } catch (err) {
    console.error('โหลดรูปภาพไม่สำเร็จ:', err);
    setDormImages([]);
  }
};


// ===== handleSaveEdit =====
const handleSaveEdit = async () => {
  if (!form.dormname.trim() || !form.lat.trim() || !form.long.trim()) {
    alert("กรุณากรอกชื่อหอพัก และตำแหน่งละติจูด/ลองจิจูด");
    return;
  }

  try {
    // ✅ รวม facilities
    const fullFacilities = [...form.facilities];
    if (form.facilitiesOther.trim()) {
      const extras = form.facilitiesOther.split(',').map(f => f.trim()).filter(f => f !== '');
      fullFacilities.push(...extras);
    }

    // ✅ รวม security
    const fullSecurity = [...form.security];
    if (form.securityOther.trim()) {
      const extras = form.securityOther.split(',').map(s => s.trim()).filter(s => s !== '');
      fullSecurity.push(...extras);
    }

    const payload = { 
      dormname: form.dormname,
      address: form.address,
      facilities: fullFacilities,
      security: fullSecurity,
      lat: form.lat,
      long: form.long,
      userid: userId,
      rooms: (form.rooms || []).map(r => ({
        roomid: r.roomid || null,
        roomtype: r.roomtype || "",
        pricemonthly: r.pricemonthly ? Number(r.pricemonthly) : null,
        priceterm: r.priceterm ? Number(r.priceterm) : null
      }))
    };

    await axios.put(`${API}/dormitories/${editingDorm.dormid}`, payload);

    if (approvedDormsRef.current) approvedDormsRef.current();

    setEditingDorm(null);
    const res = await axios.get(`${API}/dormitories/mine/${userId}`);
    setDorms(res.data);
  } catch (err) { 
    console.error('แก้ไขไม่สำเร็จ:', err.response?.data || err.message); 
    alert('❌ บันทึกไม่สำเร็จ กรุณาตรวจสอบ console');
  }
};



  const handleDelete = async (dormId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหอพักนี้?')) {
      try {
        await axios.delete(`${API}/dormitories/${dormId}`);
        setDorms(prev => prev.filter(d => d.dormid !== dormId));

        // ✅ refresh approved dorms
if (approvedDormsRef.current) {
  approvedDormsRef.current();
}

      } catch (err) { console.error('ลบไม่สำเร็จ:', err); }
    }
  };

 const handleAddDorm = async () => {
  if (!addForm.dormname.trim() || !addForm.lat.trim() || !addForm.long.trim()) {
    alert("กรุณากรอกชื่อหอพัก และตำแหน่งละติจูด/ลองจิจูด");
    return;
  }

  const facilities = [...addForm.facilities];
  if (addForm.facilities.includes('อื่นๆ') && addForm.facilitiesOther) facilities.push(addForm.facilitiesOther);
  const security = [...addForm.security];
  if (addForm.security.includes('อื่นๆ') && addForm.securityOther) security.push(addForm.securityOther);

  try {
    const payload = { 
      dormname: addForm.dormname,
      address: addForm.address,
      facilities,
      security,
      lat: addForm.lat,
      long: addForm.long,
      userid: userId,
      rooms: (addForm.rooms || []).map(r => ({
        roomtype: r.roomtype?.trim() || "",
        pricemonthly: r.pricemonthly ? Number(r.pricemonthly) : null,
        priceterm: r.priceterm ? Number(r.priceterm) : null
      }))
    };

    await axios.post(`${API}/dormitories`, payload);
    setShowAddModal(false);
    setAddForm({ dormname: '', address: '', facilities: [], facilitiesOther: '', security: [], securityOther: '', lat: '', long: '', rooms: [] });
    const res = await axios.get(`${API}/dormitories/mine/${userId}`);
    setDorms(res.data);
  } catch (err) { 
    console.error('เพิ่มหอพักไม่สำเร็จ:', err); 
  }
};

  const handleUploadImages = (dorm) => setUploadingDorm(dorm);
  const handleViewImages = async (dorm) => {
    try {
      const res = await axios.get(`${API}/images/${dorm.dormid}`);
      setDormImages(res.data); setViewingDorm(dorm);
    } catch (err) { console.error('Error fetching images:', err); }
  };
  const handleDeleteImage = async (imageid) => {
    if (window.confirm('คุณแน่ใจว่าต้องการลบรูปนี้?')) {
      try {
        await axios.delete(`${API}/images/${imageid}`);
        setDormImages(prev => prev.filter(img => img.imageid !== imageid));
      } catch (err) { console.error('Error deleting image:', err); }
    }
  };

  const renderCheckboxGroup = (label, options, selected, setSelected, otherValue, setOtherValue) => (
    <div>
      <label>{label}:</label>
      {options.map(opt => (
        <label key={opt} style={{ display: 'block' }}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={e => {
            const value = e.target.checked ? [...selected, opt] : selected.filter(f => f !== opt);
            setSelected(value);
          }} /> {opt}
        </label>
      ))}
      {selected.includes('อื่นๆ') && <input placeholder="ระบุเพิ่มเติม" value={otherValue} onChange={e => setOtherValue(e.target.value)} />}
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'mydorms':
        return (
          <div>
            <h3 style={{ marginBottom: '16px' }}>หอพักของฉัน</h3>
            <button style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowAddModal(true)}>➕ เพิ่มหอพัก</button>
            {dorms.length === 0 ? (<p>ไม่มีหอพักที่คุณเป็นเจ้าของ</p>) : (
              <table style={styles.table}>
                <thead><tr style={styles.trHeader}><th style={styles.th}>ชื่อหอพัก</th><th style={styles.th}>ที่อยู่</th><th style={styles.th}>สิ่งอำนวยความสะดวก</th><th style={styles.th}>ระบบความปลอดภัย</th><th style={styles.th}>การจัดการ</th></tr></thead>
                <tbody>
                  {dorms.map((dorm, index) => (
                    <tr key={dorm.dormid} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{dorm.dormname}</td>
                      <td style={styles.td}>{dorm.address}</td>
                      <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{renderArray(dorm.facilities)}</td>
                      <td style={{ ...styles.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{renderArray(dorm.security)}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleView(dorm)}>ดู</button>
                        <button onClick={() => handleEdit(dorm)}>แก้ไข</button>
                        <button onClick={() => handleDelete(dorm.dormid)}>ลบ</button>
                        <button onClick={() => handleUploadImages(dorm)}>📷 อัปโหลดรูป</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {viewingDorm && (
              <div style={{ marginTop: '20px', background: '#ecfdf5', padding: '20px', borderRadius: '8px' }}>
                <h3>รูปภาพของหอ: {viewingDorm.dormname}</h3>
                {dormImages.length === 0 ? (<p>ไม่มีรูปภาพ</p>) : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {dormImages.map(img => (
                      <div key={img.imageid} style={{ position: 'relative', width: '200px', height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                          src={`${API}${img.path}`}
                          alt="Dorm"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setLightboxImage(`${API}${img.path}`)}
                        />
                        <button
                          style={{
                            position: 'absolute', top: '5px', right: '5px', backgroundColor: 'red', color: 'white',
                            border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px'
                          }}
                          onClick={() => handleDeleteImage(img.imageid)}
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button style={{ marginTop: '10px', backgroundColor: '#f87171', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px' }} onClick={() => setViewingDorm(null)}>ปิด</button>
              </div>
            )}
          </div>
        );
case 'approvedDorms':
  return (
    <OwnerApprovedDormsPage
      userId={userId}
      renderArray={renderArray}
      handleView={handleView}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      handleUploadImages={handleUploadImages}
      refreshApprovedDorms={approvedDormsRef}  // ✅ ส่ง ref
    />
  );


      case 'status': return <OwnerStatusPage userId={userId} />;
      default: return <p>👋 ยินดีต้อนรับเข้าสู่แดชบอร์ดเจ้าของหอพัก</p>;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Owner</h2>
        <nav style={styles.nav}>
  <button style={styles.button} onClick={() => setActiveMenu('mydorms')}>จัดการหอพักของฉัน</button>
  <button style={styles.button} onClick={() => setActiveMenu('approvedDorms')}>หอพักที่ได้รับการอนุมัติ</button>
  <button style={styles.button} onClick={() => setActiveMenu('status')}>สถานะการอนุมัติ</button>
  <hr style={{ margin: '20px 0' }} />

  {/* ✅ ปุ่มกลับไปหน้าแผนที่ */}
  <button
    style={{ ...styles.button, backgroundColor: '#3b82f6' }}
    onClick={() => navigate('/')}
  >
    กลับไปหน้าแผนที่
  </button>

  {/* ❌ ปุ่มออกจากระบบ */}
  <button
    style={{ ...styles.button, backgroundColor: '#ef4444' }}
    onClick={() => {
      localStorage.removeItem('user');
      navigate('/');
    }}
  >
    ออกจากระบบ
  </button>
</nav>


      </aside>
      <main style={styles.main}><div style={styles.content}>{renderContent()}

        {/* ✅ UI อัปโหลดรูป ใช้ได้ทุกหน้า */}
    {uploadingDorm && (
      <div style={{ marginTop: '20px', background: '#fff7ed', padding: '20px', borderRadius: '8px', border: '1px solid #f97316' }}>
        <h3>📷 อัปโหลดรูปภาพสำหรับหอ: {uploadingDorm.dormname}</h3>
        <p>คุณสามารถอัปโหลดได้สูงสุด 5 รูป (ประเภทรูปที่อัพโหลดได้ jpg png)</p>
        <input type="file" multiple accept="image/*" onChange={e => {
          const files = e.target.files;
          if (files.length > 5) { alert('อัปโหลดได้สูงสุด 5 รูปเท่านั้น'); e.target.value = ''; return; }
          setSelectedImages(files);
        }} />
        <div style={{ marginTop: '10px' }}>
          <button onClick={async () => {
            if (!selectedImages || selectedImages.length === 0) { alert('กรุณาเลือกรูปภาพ'); return; }
            for (let i = 0; i < selectedImages.length; i++) {
              const formData = new FormData();
              formData.append('image', selectedImages[i]);
              formData.append('dormID', uploadingDorm.dormid);
              try {
                await axios.post(`${API}/images/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
              } catch (err) { console.error('เกิดข้อผิดพลาดในการอัปโหลด:', err); alert('เกิดข้อผิดพลาดในการอัปโหลดรูปที่ ' + (i + 1)); return; }
            }
            alert('✅ อัปโหลดรูปภาพสำเร็จแล้ว'); setUploadingDorm(null); setSelectedImages(null);
            if (approvedDormsRef.current) { approvedDormsRef.current(); }
          }}>✅ อัปโหลด</button>
          <button style={{ marginLeft: '10px' }} onClick={() => { setUploadingDorm(null); setSelectedImages(null); }}>❌ ยกเลิก</button>
        </div>
      </div>
    )}
  </div>
</main>

       {/* ✅ Modal: View */}
{viewDorm && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <div style={headerStyle}>รายละเอียดหอพัก</div>
      <div style={bodyStyle}>
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ชื่อหอพัก</label>
            <input style={input} value={viewDorm.dormname || ""} readOnly />
          </div>
        </div>
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ที่อยู่</label>
            <textarea style={textarea} value={viewDorm.address || ""} readOnly />
          </div>
        </div>
        
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>สิ่งอำนวยความสะดวก</label>
            <textarea style={textarea} value={renderArray(viewDorm.facilities)} readOnly />
          </div>
        </div>
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ระบบความปลอดภัย</label>
            <textarea style={textarea} value={renderArray(viewDorm.security)} readOnly />
          </div>
        </div>
        {/* ✅ ประเภทห้องและราคา (read-only) */}
<div style={{ ...row, flexDirection: "column" }}>
  <label style={label}>ประเภทห้องและราคา</label>
  {(viewDorm.rooms || []).length > 0 ? (
    (viewDorm.rooms || []).map((r, idx) => (
      <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input style={{ ...input, flex: 2 }} value={r.roomtype || ""} readOnly />
        <input style={{ ...input, flex: 1 }} value={r.pricemonthly ? `${r.pricemonthly} บาท/เดือน` : "ไม่ระบุ"} readOnly />
        <input style={{ ...input, flex: 1 }} value={r.priceterm ? `${r.priceterm} บาท/เทอม` : "ไม่ระบุ"} readOnly />
      </div>
    ))
  ) : (
    <input style={input} value="ไม่ระบุ" readOnly />
  )}
</div>

        <div style={row}>
          <div style={col(1)}>
            <label style={label}>Lat</label>
            <input style={input} value={viewDorm.lat || ""} readOnly />
          </div>
          <div style={col(1)}>
            <label style={label}>Long</label>
            <input style={input} value={viewDorm.long || ""} readOnly />
          </div>
        </div>

        {/* ✅ แสดงรูปภาพ (ไม่มีปุ่มลบ) */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>รูปภาพ</label>
            {dormImages.length === 0 ? (
              <p>ไม่มีรูปภาพ</p>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {dormImages.map(img => (
                  <div
                    key={img.imageid}
                    style={{
                      width: '150px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => setLightboxImage(`${API}${img.path}`)}
                  >
                    <img
                      src={`${API}${img.path}`}
                      alt="Dorm"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={footer}>
        <button style={btn()} onClick={() => setViewDorm(null)}>ปิด</button>
      </div>
    </div>
  </div>
)}


      {/* ✅ Modal: Edit */}
{editingDorm && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <div style={headerStyle}>แก้ไขหอพัก</div>
      <div style={bodyStyle}>
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ชื่อหอพัก</label>
            <input
              style={input}
              value={form.dormname}
              onChange={e => setForm({ ...form, dormname: e.target.value })}
            />
          </div>
        </div>

        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ที่อยู่</label>
            <textarea
              style={textarea}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>

        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ละติจูด</label>
            <input
              style={input}
              value={form.lat}
              onChange={e => setForm({ ...form, lat: e.target.value })}
            />
          </div>
          <div style={col(1)}>
            <label style={label}>ลองจิจูด</label>
            <input
              style={input}
              value={form.long}
              onChange={e => setForm({ ...form, long: e.target.value })}
            />
          </div>
        </div>

        {/* ✅ สิ่งอำนวยความสะดวก */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>สิ่งอำนวยความสะดวก</label>
            {facilityOptions.map(opt => (
              <label key={opt} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={form.facilities.includes(opt)}
                  onChange={e => {
                    const value = e.target.checked
                      ? [...form.facilities, opt]
                      : form.facilities.filter(f => f !== opt);
                    setForm({ ...form, facilities: value });
                  }}
                /> {opt}
              </label>
            ))}
            {form.facilities.includes('อื่นๆ') && (
              <input
                style={input}
                placeholder="ระบุเพิ่มเติม"
                value={form.facilitiesOther}
                onChange={e => setForm({ ...form, facilitiesOther: e.target.value })}
              />
            )}
          </div>
        </div>

        {/* ✅ ระบบความปลอดภัย */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ระบบความปลอดภัย</label>
            {securityOptions.map(opt => (
              <label key={opt} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={form.security.includes(opt)}
                  onChange={e => {
                    const value = e.target.checked
                      ? [...form.security, opt]
                      : form.security.filter(s => s !== opt);
                    setForm({ ...form, security: value });
                  }}
                /> {opt}
              </label>
            ))}
            {form.security.includes('อื่นๆ') && (
              <input
                style={input}
                placeholder="ระบุเพิ่มเติม"
                value={form.securityOther}
                onChange={e => setForm({ ...form, securityOther: e.target.value })}
              />
            )}
          </div>
        </div>

              {/* ✅ ประเภทห้องและราคา */}
<div style={{ ...row, flexDirection: "column" }}>
  <label style={label}>ประเภทห้องและราคา</label>
  {(form.rooms || []).map((r, idx) => (
    <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
      {/* ประเภทห้อง */}
<select
  style={{ ...input, width: "120px", padding: "6px 8px", fontSize: "14px" }}
  value={r.roomtype || ""}
  onChange={(e) => {
    const rooms = [...form.rooms];
    rooms[idx].roomtype = e.target.value;
    setForm({ ...form, rooms });
  }}
>
  <option value="">-- ประเภทห้อง --</option>
  <option value="แอร์">แอร์</option>
  <option value="พัดลม">พัดลม</option>
</select>


      {/* ราคา/เดือน */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="number"
          style={{ ...input, width: "100px", padding: "6px 8px", fontSize: "14px" }}
          placeholder="ราคา"
          value={r.pricemonthly || ""}
          onChange={(e) => {
            const rooms = [...form.rooms];
            rooms[idx].pricemonthly = Number(e.target.value);
            setForm({ ...form, rooms });
          }}
        />
        <span style={{ marginLeft: 4, fontSize: "13px" }}>บาท/เดือน</span>
      </div>

      {/* ราคา/เทอม */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="number"
          style={{ ...input, width: "100px", padding: "6px 8px", fontSize: "14px" }}
          placeholder="ราคา"
          value={r.priceterm || ""}
          onChange={(e) => {
            const rooms = [...form.rooms];
            rooms[idx].priceterm = Number(e.target.value);
            setForm({ ...form, rooms });
          }}
        />
        <span style={{ marginLeft: 4, fontSize: "13px" }}>บาท/เทอม</span>
      </div>

      {/* ปุ่มลบ */}
      <button
        style={{ background: "red", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
        onClick={() => {
          const rooms = form.rooms.filter((_, i) => i !== idx);
          setForm({ ...form, rooms });
        }}
      >
        ลบ
      </button>
    </div>
  ))}

  {/* ปุ่มเพิ่มห้อง */}
  <button
    style={{ background: "green", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", marginTop: 6 }}
    onClick={() =>
      setForm({
        ...form,
        rooms: [...(form.rooms || []), { roomtype: "", pricemonthly: "", priceterm: "" }],
      })
    }
  >
    ➕ เพิ่มห้อง
  </button>
</div>

        {/* ✅ แสดงรูปภาพ */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>รูปภาพ</label>
            {dormImages.length === 0 ? (
              <p>ไม่มีรูปภาพ</p>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {dormImages.map(img => (
                  <div
                    key={img.imageid}
                    style={{
                      position: 'relative',
                      width: '150px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={`${API}${img.path}`}
                      alt="Dorm"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setLightboxImage(`${API}${img.path}`)}
                    />
                    <button
                      style={{
                        position: 'absolute', top: '5px', right: '5px',
                        backgroundColor: 'red', color: 'white',
                        border: 'none', borderRadius: '4px',
                        cursor: 'pointer', padding: '2px 6px'
                      }}
                      onClick={() => handleDeleteImage(img.imageid)}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={footer}>
        <button style={btn("#3b82f6")} onClick={handleSaveEdit}>บันทึก</button>
        <button style={btn("#ef4444")} onClick={() => setEditingDorm(null)}>ยกเลิก</button>
      </div>
    </div>
  </div>
)}

{/* ✅ Modal: Add */}
{showAddModal && (
  <div style={overlayStyle}>
    <div style={modalStyle}>
      <div style={headerStyle}>เพิ่มหอพักใหม่</div>
      <div style={bodyStyle}>
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ชื่อหอพัก</label>
            <input
              style={input}
              value={addForm.dormname}
              onChange={e => setAddForm({ ...addForm, dormname: e.target.value })}
            />
          </div>
        </div>

        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ที่อยู่</label>
            <textarea
              style={textarea}
              value={addForm.address}
              onChange={e => setAddForm({ ...addForm, address: e.target.value })}
            />
          </div>
        </div>

        <div style={row}>
  <div style={col(1)}>
    <label style={label}>ละติจูด</label>
    <input
      style={input}
      value={addForm.lat}
      onChange={e => setAddForm({ ...addForm, lat: e.target.value })}
    />
    {/* ✅ ปุ่มอธิบายวิธีการหา Lat/Long */}
    <button
      type="button"
      style={{
        marginTop: "6px",
        backgroundColor: "#e81111ff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "13px"
      }}
      onClick={() => {
        alert(
`วิธีนำละติจูด/ลองจิจูดจาก Google Maps:
1. เข้า Google Maps
2. นำเมาส์ไปชี้ตำแหน่งที่ต้องการ
3. คลิกขวา → เลือก "พิกัด"
4. คัดลอกตัวเลข (ละติจูด, ลองจิจูด) มาใส่ที่นี่`
        );
      }}
    >
      วิธีหาค่า ละติจูด/ลองจิจูด
    </button>
    <a
      href="https://www.google.com/maps"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", marginTop: "4px", fontSize: "13px", color: "#12ba0aff" }}
    >
      🌍 เปิด Google Maps
    </a>
  </div>

  <div style={col(1)}>
    <label style={label}>ลองจิจูด</label>
    <input
      style={input}
      value={addForm.long}
      onChange={e => setAddForm({ ...addForm, long: e.target.value })}
    />
  </div>
</div>


        {/* ✅ สิ่งอำนวยความสะดวก */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>สิ่งอำนวยความสะดวก</label>
            {facilityOptions.map(opt => (
              <label key={opt} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={addForm.facilities.includes(opt)}
                  onChange={e => {
                    const value = e.target.checked
                      ? [...addForm.facilities, opt]
                      : addForm.facilities.filter(f => f !== opt);
                    setAddForm({ ...addForm, facilities: value });
                  }}
                /> {opt}
              </label>
            ))}
            {addForm.facilities.includes('อื่นๆ') && (
              <input
                style={input}
                placeholder="ระบุเพิ่มเติม"
                value={addForm.facilitiesOther}
                onChange={e => setAddForm({ ...addForm, facilitiesOther: e.target.value })}
              />
            )}
          </div>
        </div>

        {/* ✅ ระบบความปลอดภัย */}
        <div style={row}>
          <div style={col(1)}>
            <label style={label}>ระบบความปลอดภัย</label>
            {securityOptions.map(opt => (
              <label key={opt} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={addForm.security.includes(opt)}
                  onChange={e => {
                    const value = e.target.checked
                      ? [...addForm.security, opt]
                      : addForm.security.filter(s => s !== opt);
                    setAddForm({ ...addForm, security: value });
                  }}
                /> {opt}
              </label>
            ))}
            {addForm.security.includes('อื่นๆ') && (
              <input
                style={input}
                placeholder="ระบุเพิ่มเติม"
                value={addForm.securityOther}
                onChange={e => setAddForm({ ...addForm, securityOther: e.target.value })}
              />
            )}
          </div>
        </div>

        {/* ✅ ประเภทห้องและราคา */}
        <div style={{ ...row, flexDirection: "column" }}>
          <label style={label}>ประเภทห้องและราคา</label>
          {(addForm.rooms || []).map((r, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              {/* ประเภทห้อง */}
<select
  style={{ ...input, width: "120px", padding: "6px 8px", fontSize: "14px" }}
  value={r.roomtype || ""}
  onChange={(e) => {
    const rooms = [...addForm.rooms];
    rooms[idx].roomtype = e.target.value;
    setAddForm({ ...addForm, rooms });
  }}
>
  <option value="">-- ประเภทห้อง --</option>
  <option value="แอร์">แอร์</option>
  <option value="พัดลม">พัดลม</option>
</select>

              {/* ราคา/เดือน */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  style={{ ...input, width: "100px", padding: "6px 8px", fontSize: "14px" }}
                  placeholder="ราคา"
                  value={r.pricemonthly || ""}
                  onChange={e => {
                    const rooms = [...addForm.rooms];
                    rooms[idx].pricemonthly = Number(e.target.value);
                    setAddForm({ ...addForm, rooms });
                  }}
                />
                <span style={{ marginLeft: 4, fontSize: "13px" }}>บาท/เดือน</span>
              </div>
              {/* ราคา/เทอม */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  style={{ ...input, width: "100px", padding: "6px 8px", fontSize: "14px" }}
                  placeholder="ราคา"
                  value={r.priceterm || ""}
                  onChange={e => {
                    const rooms = [...addForm.rooms];
                    rooms[idx].priceterm = Number(e.target.value);
                    setAddForm({ ...addForm, rooms });
                  }}
                />
                <span style={{ marginLeft: 4, fontSize: "13px" }}>บาท/เทอม</span>
              </div>
              {/* ปุ่มลบ */}
              <button
                style={{ background: "red", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                onClick={() => {
                  const rooms = addForm.rooms.filter((_, i) => i !== idx);
                  setAddForm({ ...addForm, rooms });
                }}
              >
                ลบ
              </button>
            </div>
          ))}
          {/* ปุ่มเพิ่มห้อง */}
          <button
            style={{ background: "green", color: "white", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", marginTop: 6 }}
            onClick={() => setAddForm({ ...addForm, rooms: [...(addForm.rooms || []), { roomtype: "", pricemonthly: "", priceterm: "" }] })}
          >
            ➕ เพิ่มห้อง
          </button>
        </div>
      </div>
      <div style={footer}>
        <button style={btn("#3b82f6")} onClick={handleAddDorm}>บันทึก</button>
        <button style={btn("#ef4444")} onClick={() => setShowAddModal(false)}>ยกเลิก</button>
      </div>
    </div>
  </div>
)}


      {/* Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000, cursor: 'zoom-out'
          }}
        >
          <img
            src={lightboxImage}
            alt="full"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' },
  sidebar: { width: '280px', backgroundColor: '#1f2937', padding: '20px', color: 'white' },
  logo: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
  button: { padding: '10px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' },
  main: { flex: 1, padding: '20px' },
  content: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { borderBottom: '2px solid #e5e7eb', textAlign: 'left', padding: '10px' },
  td: { borderBottom: '1px solid #e5e7eb', padding: '10px' },
  trHeader: { backgroundColor: '#f3f4f6' },
  trEven: { backgroundColor: '#ffffff' },
  trOdd: { backgroundColor: '#f9fafb' },
};

// ===== Modal Styles =====
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  width: "720px",
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflow: "auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};

const headerStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #eee",
  fontSize: 20,
  fontWeight: 700,
};

const bodyStyle = { padding: 20 };

const row = { display: "flex", gap: 12, marginBottom: 12 };
const col = (w = 1) => ({ flex: w, display: "flex", flexDirection: "column" });

const label = { fontWeight: 600, marginBottom: 6 };
const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
};
const textarea = { ...input, resize: "vertical" };

const footer = {
  padding: 16,
  borderTop: "1px solid #eee",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const btn = (bg = "#374151") => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
});

export default OwnerDashboardPage;
