const express = require('express');
const router = express.Router();

const {
  getAllDorms,
  getDormsByUserID,
  createDorm,
  updateDorm,
  deleteDorm,
  getApprovedDormsByUserID   // ✅ เพิ่มเข้ามา
} = require('../controllers/dormsController');

// ดึงหอพักทั้งหมด (Admin)
router.get('/', getAllDorms);

// ดึงหอพักเฉพาะของเจ้าของ (Owner)
router.get('/mine/:userId', getDormsByUserID);

// เพิ่มหอพักใหม่
router.post('/', createDorm);

// แก้ไขหอพัก
router.put('/:id', updateDorm);

// ลบหอพัก
router.delete('/:id', deleteDorm);

// ✅ ดึงหอพักที่ได้รับการอนุมัติ
router.get('/approved/:userid', getApprovedDormsByUserID);

module.exports = router;
