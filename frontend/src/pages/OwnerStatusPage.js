// src/pages/OwnerStatusPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API;

const OwnerStatusPage = ({ userId }) => {
  const [dorms, setDorms] = useState([]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API}/dormitories/mine/${userId}`)
        .then((res) => setDorms(res.data))
        .catch((err) => console.error("Error fetching status:", err));
    }
  }, [userId]);

  return (
    <div>
      <h3 style={{ marginBottom: "16px" }}>📄 สถานะการอนุมัติหอพัก</h3>
      {dorms.length === 0 ? (
        <p>ยังไม่มีเนื้อหา</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={th}>ชื่อหอพัก</th>
              <th style={th}>ที่อยู่</th>
              <th style={th}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {dorms.map((dorm) => (
              <tr key={dorm.dormid}>
                <td style={td}>{dorm.dormname}</td>
                <td style={td}>{dorm.address}</td>
                <td style={td}>
                  {dorm.isapproved === "approved"
                    ? "✅ อนุมัติแล้ว"
                    : dorm.isapproved === "rejected"
                    ? "❌ ไม่อนุมัติ"
                    : "⌛ รอตรวจสอบ"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const th = { padding: 10, borderBottom: "2px solid #ddd", textAlign: "left" };
const td = { padding: 10, borderBottom: "1px solid #ddd" };

export default OwnerStatusPage;
