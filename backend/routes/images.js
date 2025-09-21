const express = require('express');
const router = express.Router();
const { uploadImage, getAllImages, getImagesByDormID, deleteImageById } = require('../controllers/imagesController'); // ✅ เพิ่ม deleteImageById
const multer = require('multer');
const path = require('path');

// 📦 ตั้งค่า Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ POST: อัปโหลดรูป
router.post('/upload', upload.single('image'), uploadImage);

// ✅ DELETE: ลบรูปตาม imageid
router.delete('/:imageid', deleteImageById);

// ✅ GET: รูปทั้งหมด
router.get('/', getAllImages);

// ✅ GET: รูปของหอพักตาม dormid
router.get('/:dormid', getImagesByDormID);

module.exports = router;
