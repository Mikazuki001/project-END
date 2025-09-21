const express = require("express");
const router = express.Router();
const {
  getPendingDorms,
  approveDorm,
  rejectDorm
} = require("../controllers/adminDormsController");

// ✅ ดึงหอพักที่ pending
router.get("/", getPendingDorms);

// ✅ อนุมัติ
router.put("/:id/approve", approveDorm);

// ❌ ปฏิเสธ
router.put("/:id/reject", rejectDorm);

module.exports = router;
