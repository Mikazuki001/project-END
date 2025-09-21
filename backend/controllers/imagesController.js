const pool = require('../db');
const fs = require('fs');
const path = require('path');

// ✅ อัปโหลดรูป
exports.uploadImage = async (req, res) => {
  try {
    const { dormID } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // บันทึก path ลง DB
    const filePath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      'INSERT INTO dorm_images (path, dormid) VALUES ($1, $2) RETURNING *',
      [filePath, dormID]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// ✅ ดึงรูปทั้งหมด
exports.getAllImages = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT imageid, dormid, path FROM dorm_images ORDER BY imageid ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to get images:', err);
    res.status(500).json({ error: 'Failed to get images' });
  }
};

// ✅ ดึงรูปตาม DormID
exports.getImagesByDormID = async (req, res) => {
  try {
    const dormID = req.params.dormid;
    const result = await pool.query(
      'SELECT imageid, path FROM dorm_images WHERE dormid = $1 ORDER BY imageid ASC',
      [dormID]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to get images by dormid:', err);
    res.status(500).json({ error: 'Failed to get images by dormid' });
  }
};

// ✅ ลบรูปตาม imageid
exports.deleteImageById = async (req, res) => {
  try {
    const imageid = req.params.imageid;

    // หา path ก่อนลบ
    const find = await pool.query(
      'SELECT path FROM dorm_images WHERE imageid = $1',
      [imageid]
    );
    if (find.rowCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const filePath = path.join(__dirname, '..', find.rows[0].path);

    // ลบออกจาก DB
    const result = await pool.query(
      'DELETE FROM dorm_images WHERE imageid = $1 RETURNING *',
      [imageid]
    );

    // ลบไฟล์จริงออกจากโฟลเดอร์ uploads (ไม่บังคับ)
    fs.unlink(filePath, (err) => {
      if (err) console.warn('⚠️ Cannot delete file from disk:', err.message);
    });

    res.json({ message: 'Image deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('❌ Delete failed:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
