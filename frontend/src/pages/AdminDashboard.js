// AdminDashboardPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageDormsAdmin from "./AdminX/ManageDormsAdmin";
import ManageUsers from './AdminX/ManageUsers';
import Reports from './AdminX/Reports';

const AdminDashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState('users');
  const navigate = useNavigate();

  // ---------------------- renderContent ----------------------
  const renderContent = () => {
    if (activeMenu === 'users') return <ManageUsers />;
    if (activeMenu === 'dorms') return <ManageDormsAdmin />;
    if (activeMenu === 'report') return <Reports />;
    return null;
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Admin</h2>
        <nav style={styles.nav}>
          <button style={styles.button} onClick={() => setActiveMenu('dorms')}>
            จัดการข้อมูลหอพัก
          </button>
          <button style={styles.button} onClick={() => setActiveMenu('users')}>
            จัดการผู้ใช้งาน
          </button>
          <button style={styles.button} onClick={() => setActiveMenu('report')}>
            รายงานข้อมูลหอพัก
          </button>

          <hr style={{ margin: '20px 0' }} />

          {/* 🔙 ปุ่มกลับไปหน้าแผนที่ */}
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

      <main style={styles.main}>
        <div style={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: 'sans-serif' },
  sidebar: { width: '240px', background: '#1f2937', color: 'white', padding: '20px 12px' },
  logo: { marginBottom: '20px', fontSize: '22px', textAlign: 'center' },
  nav: { display: 'flex', flexDirection: 'column', gap: '12px' },
  button: {
    background: '#374151',
    color: 'white',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
  },
  main: { flex: 1, background: '#f9fafb', padding: '40px' },
  content: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
};

export default AdminDashboardPage;
