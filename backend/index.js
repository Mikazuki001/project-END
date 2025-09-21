const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const dormRoutes = require('./routes/dorms');
const userRoutes = require('./routes/users');
const imageRoutes = require('./routes/images');
const pendingDormsRoutes = require('./routes/pendingDorms'); // ✅ ประกาศแค่ครั้งเดียว

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ ให้เข้าถึงรูปภาพที่อยู่ในโฟลเดอร์ uploads ได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/dormitories', dormRoutes);
app.use('/users', userRoutes);
app.use('/images', imageRoutes);
app.use("/pending-dorms", pendingDormsRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
