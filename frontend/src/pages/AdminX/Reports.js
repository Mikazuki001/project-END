import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API; // ✅ ใช้ .env

const Reports = () => {
  const [pendingDorms, setPendingDorms] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลหอพักที่ pending
  useEffect(() => {
    fetchPendingDorms();
  }, []);

  const fetchPendingDorms = async () => {
    try {
      const res = await axios.get(`${API}/pending-dorms`);
      setPendingDorms(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching pending dorms:", err);
      setLoading(false);
    }
  };

  // ✅ อนุมัติ
  const approveDorm = async (id) => {
    try {
      await axios.put(`${API}/pending-dorms/${id}/approve`);
      alert("อนุมัติสำเร็จ ✅");
      fetchPendingDorms(); // refresh
    } catch (err) {
      console.error("❌ Approve error:", err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  // ❌ ปฏิเสธ
  const rejectDorm = async (id) => {
    try {
      await axios.put(`${API}/pending-dorms/${id}/reject`);
      alert("ปฏิเสธสำเร็จ ❌");
      fetchPendingDorms(); // refresh
    } catch (err) {
      console.error("❌ Reject error:", err);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <div>
      <h3>รายงานหอพักที่รอตรวจสอบ</h3>
      {pendingDorms.length === 0 ? (
        <p>ไม่มีหอพักที่รอตรวจสอบ</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>ชื่อหอพัก</th>
              <th>ที่อยู่</th>
              <th>สิ่งอำนวยความสะดวก</th>
              <th>ระบบความปลอดภัย</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {pendingDorms.map((dorm) => (
              <tr key={dorm.dormid}>
                <td>{dorm.dormid}</td>
                <td>{dorm.dormname}</td>
                <td>{dorm.address}</td>
                <td>
                  {dorm.facilities && dorm.facilities.length > 0
                    ? dorm.facilities.join(", ")
                    : "ไม่มีข้อมูล"}
                </td>
                <td>
                  {dorm.security && dorm.security.length > 0
                    ? dorm.security.join(", ")
                    : "ไม่มีข้อมูล"}
                </td>
                <td>{dorm.isapproved}</td>
                <td>
                  <button onClick={() => approveDorm(dorm.dormid)}>✅ อนุมัติ</button>
                  <button
                    style={{ marginLeft: "10px", color: "red" }}
                    onClick={() => rejectDorm(dorm.dormid)}
                  >
                    ❌ ปฏิเสธ
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

export default Reports;
