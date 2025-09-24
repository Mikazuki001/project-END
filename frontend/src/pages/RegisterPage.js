// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    phoneNumber: '',
    address: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, { ...form, status: 'owner' });
      alert('สมัครสำเร็จ!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('สมัครไม่สำเร็จ');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #e0f7fa, #4fc3f7)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          สร้างบัญชีผู้ใช้
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <input
            type="text"
            name="username"
            placeholder="ชื่อผู้ใช้"
            value={form.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="name"
            placeholder="ชื่อจริง"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="เบอร์โทรศัพท์"
            value={form.phoneNumber}
            onChange={handleChange}
            style={inputStyle}
          />
          <textarea
            name="address"
            placeholder="ที่อยู่"
            value={form.address}
            onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
          ></textarea>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#0288d1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            สมัคร
          </button>
        </form>
      </div>
    </div>
  );
};

// ✅ สไตล์ input
const inputStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '14px',
};

export default RegisterPage;
