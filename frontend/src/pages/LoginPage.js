// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API}/users/login`, {
        username,
        password,
      });

      const { name, status, userid } = response.data;

      // เก็บ user ลง localStorage
      localStorage.setItem("user", JSON.stringify({ name, status, userid }));

      if (status === "admin") {
        navigate("/admin");
      } else if (status === "owner") {
        navigate("/owner");
      } else {
        alert("ไม่พบสิทธิ์การใช้งาน");
      }
    } catch (err) {
      alert("❌ Login ไม่สำเร็จ");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffffffff, #06b6d4)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          เข้าสู่ระบบ
        </h2>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            ชื่อผู้ใช้
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />
        </div>
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#0aaff0ff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
