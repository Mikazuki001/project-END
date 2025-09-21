const pool = require("../db");

// ✅ Helper: parse array ปลอดภัย
function safeParseArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
}

// ✅ ดึงหอพัก pending
exports.getPendingDorms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dormid, dormname, address, facilities, security, isapproved
       FROM dormitories
       WHERE isapproved = 'pending'
       ORDER BY dormid ASC`
    );

    const rows = result.rows.map((r) => ({
      ...r,
      facilities: safeParseArray(r.facilities),
      security: safeParseArray(r.security),
    }));

    res.json(rows);
  } catch (err) {
    console.error("❌ getPendingDorms error:", err);
    res.status(500).json({ error: "Failed to fetch pending dorms" });
  }
};

// ✅ อนุมัติ
exports.approveDorm = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE dormitories SET isapproved = 'approved' WHERE dormid = $1`,
      [id]
    );
    res.json({ message: "Dorm approved" });
  } catch (err) {
    console.error("❌ approveDorm error:", err);
    res.status(500).json({ error: "Approve failed" });
  }
};

// ❌ ปฏิเสธ (ไม่ต้องใส่เหตุผล)
exports.rejectDorm = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE dormitories SET isapproved = 'rejected' WHERE dormid = $1`,
      [id]
    );
    res.json({ message: "Dorm rejected" });
  } catch (err) {
    console.error("❌ rejectDorm error:", err);
    res.status(500).json({ error: "Reject failed" });
  }
};
