// src/pages/OwnerApprovedDormsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API;

const OwnerApprovedDormsPage = ({
  userId,
  renderArray,
  handleView,
  handleEdit,
  handleDelete,
  handleUploadImages,
  refreshApprovedDorms, // ✅ รับจาก OwnerDashboardPage
}) => {
  const [dorms, setDorms] = useState([]);

  // ✅ โหลดข้อมูลหอพักที่อนุมัติแล้ว
  const fetchApprovedDorms = async () => {
    try {
      const res = await axios.get(`${API}/dormitories/approved/${userId}`);
      setDorms(res.data);
    } catch (err) {
      console.error("Error fetching approved dorms:", err);
    }
  };

  // ✅ โหลดข้อมูลครั้งแรก
  useEffect(() => {
    if (userId) fetchApprovedDorms();
  }, [userId]);

  // ✅ ให้ OwnerDashboardPage สามารถสั่ง refresh ได้
  useEffect(() => {
    if (refreshApprovedDorms) {
      refreshApprovedDorms.current = fetchApprovedDorms;
    }
  }, [refreshApprovedDorms]);

  return (
    <div>
      <h3 style={{ marginBottom: "16px" }}>🏠 หอพักที่ได้รับการอนุมัติแล้ว</h3>
      {dorms.length === 0 ? (
        <p>ยังไม่มีหอพักที่อนุมัติแล้ว</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={th}>ชื่อหอพัก</th>
              <th style={th}>ที่อยู่</th>
              <th style={th}>สิ่งอำนวยความสะดวก</th>
              <th style={th}>ระบบความปลอดภัย</th>
              <th style={th}>ประเภทห้องและราคา</th>
              <th style={th}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {dorms.map((dorm, index) => (
              <tr key={dorm.dormid} style={index % 2 === 0 ? trEven : trOdd}>
                <td style={td}>{dorm.dormname}</td>
                <td style={td}>{dorm.address}</td>
                <td style={td}>{renderArray(dorm.facilities)}</td>
                <td style={td}>{renderArray(dorm.security)}</td>
                <td style={td}>
                  {(dorm.rooms || []).length > 0 ? (
                    dorm.rooms.map((r, idx) => (
                      <div key={idx}>
                        {r.roomtype || "ไม่ระบุ"}{" "}
                        {r.pricemonthly
                          ? `- ${r.pricemonthly} บาท/เดือน`
                          : ""}
                        {r.priceterm ? ` - ${r.priceterm} บาท/เทอม` : ""}
                      </div>
                    ))
                  ) : (
                    <span>ไม่ระบุ</span>
                  )}
                </td>
                <td style={td}>
                  <button onClick={() => handleView(dorm)}>ดู</button>
                  <button onClick={() => handleEdit(dorm)}>แก้ไข</button>
                  <button
                    onClick={async () => {
                      await handleDelete(dorm.dormid);
                      fetchApprovedDorms(); // ✅ รีโหลดหลังลบ
                    }}
                  >
                    ลบ
                  </button>
                  <button
                    onClick={() => {
                      handleUploadImages(dorm);
                      fetchApprovedDorms(); // ✅ รีโหลดหลังอัปโหลด
                    }}
                  >
                    📷 อัปโหลดรูป
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ✅ สไตล์เหมือน OwnerDashboardPage
const th = {
  borderBottom: "2px solid #e5e7eb",
  textAlign: "left",
  padding: "10px",
};
const td = { borderBottom: "1px solid #e5e7eb", padding: "10px" };
const trEven = { backgroundColor: "#ffffff" };
const trOdd = { backgroundColor: "#f9fafb" };

export default OwnerApprovedDormsPage;
