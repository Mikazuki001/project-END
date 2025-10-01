// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f2937, #111827)", // ดำ-น้ำเงินเข้ม
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      {/* ชื่อระบบ */}
      <h1 style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
        🏠 ระบบค้นหาหอพักสำหรับนักศึกษา
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
        มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา พิษณุโลก
      </h2>

      {/* รายละเอียดระบบ */}
      <p style={{ maxWidth: "600px", marginBottom: "32px", lineHeight: "1.6" }}>
        ระบบนี้ถูกพัฒนาขึ้นเพื่ออำนวยความสะดวกแก่นักศึกษา
        ในการค้นหาหอพักรอบมหาวิทยาลัย โดยสามารถดูข้อมูลหอพัก
        สิ่งอำนวยความสะดวก ระบบความปลอดภัย รวมถึงแผนที่แสดงตำแหน่งหอพักได้อย่างง่ายดาย
      </p>

      {/* ปุ่มไปหน้าแผนที่ */}
      <button
        onClick={() => navigate("/map")}
        style={{
          padding: "12px 32px",
          fontSize: "18px",
          fontWeight: "bold",
          background: "#facc15", // เหลือง
          color: "#111827", // ดำ
          border: "none",
          borderRadius: "9999px",
          cursor: "pointer",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.background = "#eab308")}
        onMouseOut={(e) => (e.target.style.background = "#facc15")}
      >
        🔎 เริ่มค้นหาหอพัก
      </button>
    </div>
  );
};

export default HomePage;
