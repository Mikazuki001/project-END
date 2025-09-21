const pool = require('../db');

// ✅ หาหอพักตาม UserID (Owner ใช้)
const getDormsByUserID = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      `SELECT d.*,
              u.name AS ownername,
              u.phonenumber,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'roomid', r.roomid,
                    'roomtype', r.roomtype,
                    'pricemonthly', r.pricemonthly,
                    'priceterm', r.priceterm
                  )
                ) FILTER (WHERE r.roomid IS NOT NULL), '[]'
              ) AS rooms
       FROM dormitories d
       LEFT JOIN dorm_rooms r ON d.dormid = r.dormid
       LEFT JOIN users u ON d.userid = u.userid
       WHERE d.userid = $1
       GROUP BY d.dormid, u.name, u.phonenumber`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get dorms' });
  }
};

// ✅ สร้างหอพักใหม่ (+ rooms)
const createDorm = async (req, res) => {
  let { dormname, address, userid, facilities, lat, long, security, rooms } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // fallback ป้องกัน undefined/null
    facilities = Array.isArray(facilities) ? facilities : [];
    security = Array.isArray(security) ? security : [];
    rooms = Array.isArray(rooms) ? rooms : [];

    const dormResult = await client.query(
      `INSERT INTO dormitories (dormname, address, userid, facilities, lat, "long", security)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        dormname,
        address,
        userid,
        JSON.stringify(facilities), 
        lat || null,
        long || null,
        JSON.stringify(security)
      ]
    );

    const dorm = dormResult.rows[0];

    // ✅ insert rooms ถ้ามี
    for (const r of rooms) {
      await client.query(
        `INSERT INTO dorm_rooms (dormid, roomtype, pricemonthly, priceterm)
         VALUES ($1,$2,$3,$4)`,
        [dorm.dormid, r.roomtype || "", r.pricemonthly || null, r.priceterm || null]
      );
    }

    await client.query('COMMIT');
    res.json(dorm);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Create dorm failed:", err);
    res.status(500).json({ error: 'Insert failed' });
  } finally {
    client.release();
  }
};

// ✅ ดึงหอพักทั้งหมด (Admin ใช้) → พร้อมรูปภาพ + เบอร์โทร + ห้องพัก
const getAllDorms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*,
              u.name AS ownername,
              u.phonenumber,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'roomid', r.roomid,
                    'roomtype', r.roomtype,
                    'pricemonthly', r.pricemonthly,
                    'priceterm', r.priceterm
                  )
                ) FILTER (WHERE r.roomid IS NOT NULL), '[]'
              ) AS rooms,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'imageid', i.imageid,
                    'path', i.path
                  )
                ) FILTER (WHERE i.imageid IS NOT NULL), '[]'
              ) AS images
       FROM dormitories d
       LEFT JOIN users u ON d.userid = u.userid
       LEFT JOIN dorm_rooms r ON d.dormid = r.dormid
       LEFT JOIN dorm_images i ON d.dormid = i.dormid
       GROUP BY d.dormid, u.name, u.phonenumber
       ORDER BY d.dormid ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get all dorms' });
  }
};

// ✅ อัปเดตหอพัก + ห้อง (รองรับสองกรณี)
const updateDorm = async (req, res) => {
  const dormId = req.params.id;
  let { dormname, address, facilities, security, lat, long, rooms } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // fallback ป้องกัน undefined/null
    facilities = Array.isArray(facilities) ? facilities : [];
    security = Array.isArray(security) ? security : [];

    // อัปเดตข้อมูลหอพัก
    await client.query(
      `UPDATE dormitories
       SET dormname = $1, address = $2, facilities = $3, security = $4, lat = $5, "long" = $6
       WHERE dormid = $7`,
      [
        dormname,
        address,
        JSON.stringify(facilities),
        JSON.stringify(security),
        lat || null,
        long || null,
        dormId
      ]
    );

    // ✅ sync rooms เฉพาะเมื่อ req.body มี rooms
    if (rooms !== undefined && Array.isArray(rooms)) {
      // ดึงห้องเก่าที่อยู่ใน DB
      const oldRoomsRes = await client.query(
        `SELECT roomid FROM dorm_rooms WHERE dormid = $1`,
        [dormId]
      );
      const oldRoomIds = oldRoomsRes.rows.map((r) => r.roomid);
      const newRoomIds = rooms.filter((r) => r.roomid).map((r) => r.roomid);

      // 🔴 ลบห้องที่ไม่มีใน req.body.rooms
      for (const oldId of oldRoomIds) {
        if (!newRoomIds.includes(oldId)) {
          await client.query(`DELETE FROM dorm_rooms WHERE roomid = $1`, [oldId]);
        }
      }

      // 🟢 อัปเดตหรือเพิ่มห้องใหม่
      for (const r of rooms) {
        if (r.roomid) {
          await client.query(
            `UPDATE dorm_rooms
             SET roomtype = $1, pricemonthly = $2, priceterm = $3
             WHERE roomid = $4 AND dormid = $5`,
            [r.roomtype || "", r.pricemonthly || null, r.priceterm || null, r.roomid, dormId]
          );
        } else {
          await client.query(
            `INSERT INTO dorm_rooms (dormid, roomtype, pricemonthly, priceterm)
             VALUES ($1,$2,$3,$4)`,
            [dormId, r.roomtype || "", r.pricemonthly || null, r.priceterm || null]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Dorm updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Update dorm failed:", err);
    res.status(500).json({ error: "Update failed" });
  } finally {
    client.release();
  }
};

// ลบห้องพัก
const deleteDorm = async (req, res) => {
  const dormId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ลบห้องที่เกี่ยวข้อง
    await client.query(`DELETE FROM dorm_rooms WHERE dormid = $1`, [dormId]);

    // ลบรูปที่เกี่ยวข้อง
    await client.query(`DELETE FROM dorm_images WHERE dormid = $1`, [dormId]);

    // ลบหอพัก
    const result = await client.query(
      'DELETE FROM dormitories WHERE dormid = $1 RETURNING *',
      [dormId]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dorm not found' });
    }

    res.json({ message: 'Dorm deleted' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  } finally {
    client.release();
  }
};


// ✅ ฟังก์ชันหาหอพักที่ได้รับการอนุมัติแล้ว
const getApprovedDormsByUserID = async (req, res) => {
  try {
    const { userid } = req.params;
    const result = await pool.query(
      `SELECT d.*,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object(
                    'roomid', r.roomid,
                    'roomtype', r.roomtype,
                    'pricemonthly', r.pricemonthly,
                    'priceterm', r.priceterm
                  )
                ) FILTER (WHERE r.roomid IS NOT NULL), '[]'
              ) AS rooms
       FROM dormitories d
       LEFT JOIN dorm_rooms r ON d.dormid = r.dormid
       WHERE d.userid = $1 AND d.isapproved = 'approved'
       GROUP BY d.dormid`,
      [userid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching approved dorms:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  getDormsByUserID,
  createDorm,
  getAllDorms,
  updateDorm,
  deleteDorm,
  getApprovedDormsByUserID   // รวมเข้าด้วยกัน
};
