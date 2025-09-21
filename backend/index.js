// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const dormRoutes = require('./routes/dorms');
const userRoutes = require('./routes/users');
const imageRoutes = require('./routes/images');
const pendingDormsRoutes = require('./routes/pendingDorms');

const pool = require('./db'); // ⬅️ import db

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ ให้เข้าถึงไฟล์ในโฟลเดอร์ uploads ได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/dormitories', dormRoutes);
app.use('/users', userRoutes);
app.use('/images', imageRoutes);
app.use('/pending-dorms', pendingDormsRoutes);

// ✅ Route สำหรับตรวจสอบว่าเชื่อมต่อ DB ได้จริง
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error('❌ Database connection error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
