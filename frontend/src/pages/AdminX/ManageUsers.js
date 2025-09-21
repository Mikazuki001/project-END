// src/pages/Admin/ManageUsers.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [editingUser, setEditingUser] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    phonenumber: '',
    status: 'owner'
  });

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    axios.get(`${API}/users`)
      .then(res => {
        const sorted = res.data.sort((a, b) => a.userid - b.userid);
        setUsers(sorted);
        setCurrentPage(1);
      })
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const handleAddUser = async () => {
    try {
      const res = await axios.post(`${API}/users`, newUser);
      setUsers(prev => [...prev, res.data]);
      setAddModalOpen(false);
      setNewUser({ username: '', password: '', name: '', phonenumber: '', status: 'owner' });
    } catch (err) {
      console.error('เพิ่มผู้ใช้ล้มเหลว:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.userid.toString().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.status && user.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

const handleView = (user) => {
  alert(
    `ดูรายละเอียด:
ID: ${user.userid}
Username: ${user.username}
Name: ${user.name || 'NoName'}
Phone: ${user.phonenumber || 'ไม่ระบุ'}
Status: ${user.status}`
  );
};

const handleEdit = (user) => {
  setEditingUser(user);
  setEditedName(user.name || '');
  setEditedStatus(user.status || '');
  setEditedPassword(user.password || '');
  setEditedPhone(user.phonenumber || '');
};


  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API}/users/${editingUser.userid}`, {
        name: editedName,
        status: editedStatus,
        password: editedPassword,
        phonenumber: editedPhone,
      });

      const updatedUsers = users.map(u =>
        u.userid === editingUser.userid
          ? { ...u, name: editedName, status: editedStatus, password: editedPassword, phonenumber: editedPhone }
          : u
      );

      setUsers(updatedUsers);
      setEditingUser(null);
    } catch (error) {
      console.error("แก้ไขไม่สำเร็จ:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
      try {
        await axios.delete(`${API}/users/${userId}`);
        setUsers(prev => prev.filter(u => u.userid !== userId));
      } catch (err) {
        console.error("ลบไม่สำเร็จ:", err);
      }
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>จัดการผู้ใช้งาน</h3>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="ค้นหา ID, Username, Name, Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '100%',
            maxWidth: '400px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => setAddModalOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          ➕ เพิ่มผู้ใช้
        </button>
      </div>

<table
  style={{
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '12px',
    fontSize: '14px',
    tableLayout: 'fixed'   // ✅ ให้ตาราง fix layout
  }}
>
  <thead>
    <tr style={{ backgroundColor: '#f3f4f6' }}>
      <th style={{ width: '5%', textAlign: 'center' }}>ID</th>
      <th style={{ width: '15%', textAlign: 'center' }}>Username</th>
      <th style={{ width: '25%', textAlign: 'center' }}>Name</th>
      <th style={{ width: '20%', textAlign: 'center' }}>Phone</th>
      <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
      <th style={{ width: '25%', textAlign: 'center' }}>การจัดการ</th>
    </tr>
  </thead>
  <tbody>
    {currentUsers.map((user, index) => (
      <tr
        key={user.userid}
        style={{
          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
          textAlign: 'center' // ✅ จัดให้อยู่ตรงกลางทุก cell
        }}
      >
        <td>{user.userid}</td>
        <td>{user.username}</td>
        <td style={{ textAlign: 'left' }}>{user.name || 'NoName'}</td> {/* ชื่อให้อยู่ชิดซ้ายอ่านง่าย */}
        <td>{user.phonenumber || '-'}</td>
        <td>{user.status}</td>
        <td>
          <button
            onClick={() => handleView(user)}
            style={{
              marginRight: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            ดู
          </button>
          <button
            onClick={() => handleEdit(user)}
            style={{
              marginRight: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(user.userid)}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            ลบ
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={handlePrev} disabled={currentPage === 1} style={{ marginRight: '10px', padding: '6px 12px' }}>◀ หน้าก่อนหน้า</button>
        <span>หน้า {currentPage} / {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages} style={{ marginLeft: '10px', padding: '6px 12px' }}>หน้าถัดไป ▶</button>
      </div>

      {(editingUser || addModalOpen) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.2)', width: '300px' }}>
            {editingUser ? (
              <>
                <h3>แก้ไขผู้ใช้: {editingUser.username}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <label>ชื่อ:</label><br />
                  <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>รหัสผ่าน:</label><br />
                  <input type="text" value={editedPassword} onChange={e => setEditedPassword(e.target.value)} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>เบอร์โทรศัพท์:</label><br />
                  <input type="text" value={editedPhone} onChange={e => setEditedPhone(e.target.value)} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>สถานะ:</label><br />
                  <select value={editedStatus} onChange={e => setEditedStatus(e.target.value)}>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                </div>
                <button onClick={handleSaveEdit}>บันทึก</button>
                <button onClick={() => setEditingUser(null)}>ยกเลิก</button>
              </>
            ) : (
              <>
                <h3>เพิ่มผู้ใช้ใหม่</h3>
                <div style={{ marginBottom: '10px' }}>
                  <label>Username:</label><br />
                  <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>รหัสผ่าน:</label><br />
                  <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>ชื่อ:</label><br />
                  <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>เบอร์โทรศัพท์:</label><br />
                  <input value={newUser.phonenumber} onChange={e => setNewUser({ ...newUser, phonenumber: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>สถานะ:</label><br />
                  <select value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })}>
                    <option value="admin">admin</option>
                    <option value="owner">owner</option>
                  </select>
                </div>
                <button onClick={handleAddUser}>บันทึก</button>
                <button onClick={() => setAddModalOpen(false)}>ยกเลิก</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
