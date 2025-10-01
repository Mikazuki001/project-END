// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",         // ✅ ใช้ minHeight แทน height
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f2937, #111827)", // ดำ-น้ำเงินเข้ม
        color: "white",
        textAlign: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* กล่องเนื้อหา (เว้น footer) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
          🏠 ระบบค้นหาหอพักสำหรับนักศึกษา
        </h1>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
          มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา พิษณุโลก
        </h2>

        <p style={{ maxWidth: "600px", marginBottom: "32px", lineHeight: "1.6" }}>
          ระบบนี้ถูกพัฒนาขึ้นเพื่ออำนวยความสะดวกแก่นักศึกษา
          ในการค้นหาหอพักรอบมหาวิทยาลัย โดยสามารถดูข้อมูลหอพัก
          สิ่งอำนวยความสะดวก ระบบความปลอดภัย รวมถึงแผนที่แสดงตำแหน่งหอพักได้อย่างง่ายดาย
        </p>

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

      {/* ✅ Footer อยู่ชิดล่างเสมอ */}
      <div
        style={{
          textAlign: "right",
          width: "100%",
          padding: "10px 20px",
          fontSize: "14px",
          color: "rgba(255,255,255,0.6)", // ตัวจาง
        }}
      >
        © ลิขสิทธิ์เป็นของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา พิษณุโลก
      </div>
    </div>
  );
};

export default HomePage;
