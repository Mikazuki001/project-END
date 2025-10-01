// frontend/src/pages/AdminX/ManageDormsAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API;

// ————— Utils —————
const normalizeImages = (imgs) => {
  if (!imgs) return [];
  if (!Array.isArray(imgs)) return [];
  return imgs
    .filter(Boolean)
    .map((x) =>
      typeof x === "string"
        ? { imageid: undefined, path: x }
        : {
            imageid: x.imageid ?? x.id ?? x.imageId ?? undefined,
            path: x.path ?? x.url ?? x.src ?? "",
          }
    )
    .filter((x) => x.path);
};

const facilityOptions = ['Wi-Fi', 'เครื่องซักผ้า', 'ที่จอดรถ', 'ร้านค้า', 'อื่นๆ'];
const securityOptions = ['กล้องวงจรปิด', 'รปภ.', 'คีย์การ์ด', 'ประตูล็อก 2 ชั้น', 'อื่นๆ'];

// ————— Styles —————
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
const btnDanger = btn("#ef4444");
const btnPrimary = btn("#16a34a");
const thumbWrap = {
  position: "relative",
  width: 150,
  height: 110,
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const closeX = {
  position: "absolute",
  top: 6,
  right: 6,
  background: "#ef4444",
  color: "#fff",
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

// Pagination styles
const paginationContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  gap: "10px",
};

const paginationButton = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  background: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  color: "#374151",
};

const paginationButtonDisabled = {
  ...paginationButton,
  cursor: "not-allowed",
  color: "#9ca3af",
  background: "#f9fafb",
};

const paginationInfo = {
  fontSize: "14px",
  color: "#6b7280",
};

// ————— Component —————
export default function ManageDormsAdmin() {
  const [dorms, setDorms] = useState([]);
  const [search, setSearch] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editDorm, setEditDorm] = useState(null);
  const [viewDorm, setViewDorm] = useState(null);
  const [form, setForm] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  // โหลดหอพักทั้งหมด
  const loadDorms = async () => {
    try {
      const res = await axios.get(`${API}/dormitories`);
      setDorms(res.data || []);
    } catch (e) {
      console.error("fetch dorms error:", e);
    }
  };

  useEffect(() => {
    loadDorms();
  }, []);

  // ฟิลเตอร์ค้นหา
  const filtered = useMemo(
    () =>
      dorms.filter(
        (d) =>
          (d.dormname || "").toLowerCase().includes(search.toLowerCase()) ||
          (d.ownername || "").toLowerCase().includes(search.toLowerCase())
      ),
    [dorms, search]
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDorms = filtered.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  const onEdit = (d) => {
    let facilitiesList = d.facilities;
    let securityList = d.security;

    try {
      if (typeof facilitiesList === 'string') facilitiesList = JSON.parse(facilitiesList);
      if (typeof securityList === 'string') securityList = JSON.parse(securityList);
    } catch {}

    const selectedFacilities = Array.isArray(facilitiesList)
      ? facilitiesList.filter(f => facilityOptions.includes(f))
      : [];
    const otherFacilities = Array.isArray(facilitiesList)
      ? facilitiesList.filter(f => !facilityOptions.includes(f))
      : [];

    const selectedSecurity = Array.isArray(securityList)
      ? securityList.filter(s => securityOptions.includes(s))
      : [];
    const otherSecurity = Array.isArray(securityList)
      ? securityList.filter(s => !securityOptions.includes(s))
      : [];

    setEditDorm(d);
    setForm({
      ...d,
      images: normalizeImages(d.images),
      facilities: selectedFacilities,
      facilitiesOther: otherFacilities.join(', '),
      security: selectedSecurity,
      securityOther: otherSecurity.join(', '),
    });
    setNewImages([]);
  };

  // save edit
  const saveEdit = async () => {
    try {
      const fullFacilities = [...(form.facilities || [])];
      if (form.facilitiesOther?.trim()) {
        fullFacilities.push(...form.facilitiesOther.split(',').map(f => f.trim()).filter(Boolean));
      }

      const fullSecurity = [...(form.security || [])];
      if (form.securityOther?.trim()) {
        fullSecurity.push(...form.securityOther.split(',').map(s => s.trim()).filter(Boolean));
      }

      await axios.put(`${API}/dormitories/${editDorm.dormid}`, {
        dormname: form.dormname,
        address: form.address,
        facilities: fullFacilities,
        security: fullSecurity,
        lat: form.lat,
        long: form.long,
        rooms: form.rooms,
      });

      // upload new images
      if (newImages.length) {
        for (const file of newImages) {
          const fd = new FormData();
          fd.append("image", file);
          fd.append("dormID", String(editDorm.dormid));
          await axios.post(`${API}/images/upload`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      setEditDorm(null);
      setNewImages([]);
      await loadDorms();
    } catch (e) {
      console.error("save error:", e);
      alert("บันทึกไม่สำเร็จ");
    }
  };

  // ลบหอพัก
  const deleteDorm = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบหอพักนี้?")) return;
    try {
      await axios.delete(`${API}/dormitories/${id}`);
      await loadDorms();
    } catch (e) {
      console.error("delete dorm error:", e);
      alert("ลบไม่สำเร็จ");
    }
  };

  // ลบรูป
  const deleteImage = async (img) => {
    if (!img?.imageid) return;
    if (!window.confirm("คุณแน่ใจว่าจะลบรูปภาพนี้?")) return;
    try {
      await axios.delete(`${API}/images/${img.imageid}`);
      setForm((p) => ({
        ...p,
        images: (p.images || []).filter((i) => i.imageid !== img.imageid),
      }));
      await loadDorms();
    } catch (e) {
      console.error("delete image error:", e);
      alert("ลบรูปไม่สำเร็จ");
    }
  };

  return (
    <div>
      <h2>จัดการข้อมูลหอพัก (Admin)</h2>

      <input
        style={{ ...input, width: "100%", margin: "10px 0 18px" }}
        placeholder="🔍 ค้นหาด้วยชื่อหอพักหรือชื่อเจ้าของ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>ID</th>
            <th style={{ padding: "12px" }}>เจ้าของหอพัก</th>
            <th style={{ padding: "12px" }}>เบอร์โทร</th>
            <th style={{ padding: "12px" }}>ชื่อหอพัก</th>
            <th style={{ padding: "12px" }}>ที่อยู่</th>
            <th style={{ padding: "12px" }}>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentDorms.map((d, index) => (
            <tr
              key={d.dormid}
              style={{
                background: index % 2 === 0 ? "#fff" : "#f9fafb",
              }}
            >
              <td style={{ padding: "12px" }}>{d.dormid}</td>
              <td style={{ padding: "12px" }}>{d.ownername || "-"}</td>
              <td style={{ padding: "12px" }}>{d.phonenumber || "-"}</td>
              <td style={{ padding: "12px", fontWeight: 600 }}>{d.dormname}</td>
              <td style={{ padding: "12px", whiteSpace: "pre-wrap" }}>
                {d.address}
              </td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={() => setViewDorm(d)}
                  style={{
                    marginRight: "6px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ดู
                </button>
                <button
                  onClick={() => onEdit(d)}
                  style={{
                    marginRight: "6px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => deleteDorm(d.dormid)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationContainer}>
          <button
            style={currentPage === 1 ? paginationButtonDisabled : paginationButton}
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            หน้าแรกสุด
          </button>
          <button
            style={currentPage === 1 ? paginationButtonDisabled : paginationButton}
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            หน้าก่อนหน้า
          </button>
          <span style={paginationInfo}>
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            style={currentPage === totalPages ? paginationButtonDisabled : paginationButton}
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            หน้าถัดไป
          </button>
          <button
            style={currentPage === totalPages ? paginationButtonDisabled : paginationButton}
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            หน้าสุดท้าย
          </button>
        </div>
      )}

      {/* ——— Modal: Edit ——— */}
      {editDorm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>แก้ไขข้อมูลหอพัก</div>
            <div style={bodyStyle}>
              {/* ชื่อหอพัก */}
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>ชื่อหอพัก</label>
                  <input
                    style={input}
                    value={form.dormname || ""}
                    onChange={(e) =>
                      setForm({ ...form, dormname: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ที่อยู่ */}
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>ที่อยู่</label>
                  <input
                    style={input}
                    value={form.address || ""}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
              </div>

             {/* สิ่งอำนวยความสะดวก */}
<div style={row}>
  <div style={col(1)}>
    <label style={label}>สิ่งอำนวยความสะดวก</label>
    {facilityOptions.map(opt => (
      <label key={opt} style={{ display: 'block' }}>
        <input
          type="checkbox"
          checked={form.facilities?.includes(opt)}
          onChange={e => {
            const value = e.target.checked
              ? [...form.facilities, opt]
              : form.facilities.filter(f => f !== opt);
            setForm({ ...form, facilities: value });
          }}
        /> {opt}
      </label>
    ))}
    {form.facilities?.includes('อื่นๆ') && (
      <input
        style={input}
        placeholder="ระบุเพิ่มเติม"
        value={form.facilitiesOther || ""}
        onChange={e => setForm({ ...form, facilitiesOther: e.target.value })}
      />
    )}
  </div>
</div>

{/* ระบบความปลอดภัย */}
<div style={row}>
  <div style={col(1)}>
    <label style={label}>ระบบความปลอดภัย</label>
    {securityOptions.map(opt => (
      <label key={opt} style={{ display: 'block' }}>
        <input
          type="checkbox"
          checked={form.security?.includes(opt)}
          onChange={e => {
            const value = e.target.checked
              ? [...form.security, opt]
              : form.security.filter(s => s !== opt);
            setForm({ ...form, security: value });
          }}
        /> {opt}
      </label>
    ))}
    {form.security?.includes('อื่นๆ') && (
      <input
        style={input}
        placeholder="ระบุเพิ่มเติม"
        value={form.securityOther || ""}
        onChange={e => setForm({ ...form, securityOther: e.target.value })}
      />
    )}
  </div>
</div>

              {/* Lat / Long */}
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>Lat</label>
                  <input
                    style={input}
                    value={form.lat || ""}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  />
                </div>
                <div style={col(1)}>
                  <label style={label}>Long</label>
                  <input
                    style={input}
                    value={form.long || ""}
                    onChange={(e) => setForm({ ...form, long: e.target.value })}
                  />
                </div>
              </div>

              {/* ประเภทห้องและราคา */}
              <div style={{ ...row, flexDirection: "column" }}>
                <label style={label}>ประเภทห้องและราคา</label>
                {(form.rooms || []).map((r, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      style={{
                        ...input,
                        width: "120px",
                        padding: "6px 8px",
                        fontSize: "14px",
                      }}
                      placeholder="ประเภทห้อง"
                      value={r.roomtype || ""}
                      onChange={(e) => {
                        const rooms = [...form.rooms];
                        rooms[idx].roomtype = e.target.value;
                        setForm({ ...form, rooms });
                      }}
                    />

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="number"
                        style={{
                          ...input,
                          width: "100px",
                          padding: "6px 8px",
                          fontSize: "14px",
                        }}
                        placeholder="ราคา"
                        value={r.pricemonthly || ""}
                        onChange={(e) => {
                          const rooms = [...form.rooms];
                          rooms[idx].pricemonthly = Number(e.target.value);
                          setForm({ ...form, rooms });
                        }}
                      />
                      <span style={{ marginLeft: 4, fontSize: "13px" }}>
                        บาท/เดือน
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="number"
                        style={{
                          ...input,
                          width: "100px",
                          padding: "6px 8px",
                          fontSize: "14px",
                        }}
                        placeholder="ราคา"
                        value={r.priceterm || ""}
                        onChange={(e) => {
                          const rooms = [...form.rooms];
                          rooms[idx].priceterm = Number(e.target.value);
                          setForm({ ...form, rooms });
                        }}
                      />
                      <span style={{ marginLeft: 4, fontSize: "13px" }}>
                        บาท/เทอม
                      </span>
                    </div>

                    <button
                      style={{ ...btnDanger, padding: "6px 10px" }}
                      onClick={() => {
                        const rooms = form.rooms.filter((_, i) => i !== idx);
                        setForm({ ...form, rooms });
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
                <button
                  style={{ ...btnPrimary, marginTop: 6 }}
                  onClick={() =>
                    setForm({
                      ...form,
                      rooms: [
                        ...(form.rooms || []),
                        { roomtype: "", pricemonthly: "", priceterm: "" },
                      ],
                    })
                  }
                >
                  ➕ เพิ่มห้อง
                </button>
              </div>

              {/* รูปภาพ */}
              <div style={{ ...row, flexDirection: "column" }}>
                <label style={label}>รูปภาพ</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {(form.images || []).map((img, idx) => (
                    <div key={`${img.imageid ?? "np"}-${idx}`} style={thumbWrap}>
                      <img
                        src={`${API}${img.path}`}
                        alt="dorm"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onClick={() => setLightbox(`${API}${img.path}`)}
                      />
                      {img.imageid && (
                        <button style={closeX} onClick={() => deleteImage(img)}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  style={{ marginTop: 10 }}
                  onChange={(e) =>
                    setNewImages(Array.from(e.target.files || []))
                  }
                />
              </div>
            </div>
            <div style={footer}>
              <button style={btnPrimary} onClick={saveEdit}>
                💾 บันทึก
              </button>
              <button style={btn()} onClick={() => setEditDorm(null)}>
                ✖ ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modal: View ——— */}
      {viewDorm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>รายละเอียดหอพัก</div>
            <div style={bodyStyle}>
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>เจ้าของ</label>
                  <input
                    style={input}
                    value={viewDorm.ownername || "-"}
                    readOnly
                  />
                </div>
              </div>
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>ชื่อหอพัก</label>
                  <input
                    style={input}
                    value={viewDorm.dormname || ""}
                    readOnly
                  />
                </div>
              </div>
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>ที่อยู่</label>
                  <input
                    style={input}
                    value={viewDorm.address || ""}
                    readOnly
                  />
                </div>
              </div>
              <div style={{ ...row, flexDirection: "column" }}>
                <label style={label}>ประเภทห้องและราคา</label>
                {(viewDorm.rooms || []).length > 0 ? (
                  (viewDorm.rooms || []).map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <input
                        style={{ ...input, flex: 2 }}
                        value={r.roomtype || ""}
                        readOnly
                      />
                      <input
                        style={{ ...input, flex: 1 }}
                        value={
                          r.pricemonthly
                            ? `${r.pricemonthly} บาท/เดือน`
                            : "ไม่ระบุ"
                        }
                        readOnly
                      />
                      <input
                        style={{ ...input, flex: 1 }}
                        value={
                          r.priceterm ? `${r.priceterm} บาท/เทอม` : "ไม่ระบุ"
                        }
                        readOnly
                      />
                    </div>
                  ))
                ) : (
                  <input style={input} value="ไม่ระบุ" readOnly />
                )}
              </div>
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>สิ่งอำนวยความสะดวก</label>
                  <textarea
                    rows={3}
                    style={textarea}
                    value={viewDorm.facilities || ""}
                    readOnly
                  />
                </div>
              </div>
              <div style={row}>
                <div style={col(1)}>
                  <label style={label}>ระบบความปลอดภัย</label>
                  <textarea
                    rows={3}
                    style={textarea}
                    value={viewDorm.security || ""}
                    readOnly
                  />
                </div>
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
              <div style={{ ...row, flexDirection: "column" }}>
                <label style={label}>รูปภาพ</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {normalizeImages(viewDorm.images).length ? (
                    normalizeImages(viewDorm.images).map((img, idx) => (
                      <div
                        key={`${img.imageid ?? "v"}-${idx}`}
                        style={thumbWrap}
                      >
                        <img
                          src={`${API}${img.path}`}
                          alt="dorm"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onClick={() => setLightbox(`${API}${img.path}`)}
                        />
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "#6b7280" }}>ไม่มีรูปภาพ</span>
                  )}
                </div>
              </div>
            </div>
            <div style={footer}>
              <button style={btn()} onClick={() => setViewDorm(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.8)",
            display: "grid",
            placeItems: "center",
            zIndex: 2000,
            cursor: "zoom-out",
          }}
        >
          <img
            src={lightbox}
            alt="preview"
            style={{ maxWidth: "92vw", maxHeight: "92vh", borderRadius: 10 }}
          />
        </div>
      )}
    </div>
  );
}