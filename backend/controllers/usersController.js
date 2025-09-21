const pool = require('../db');

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
};

exports.createUser = async (req, res) => {
  const { username, password, name, phoneNumber, address, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, name, phonenumber, address, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, password, name, phoneNumber, address, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Error creating user');
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({
        name: user.name,
        status: user.status, // ส่ง role กลับ
        userid: user.userid
      });
    } else {
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, status, password, phonenumber } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, status = $2, password = $3, phonenumber = $4 WHERE userid = $5 RETURNING *',
      [name, status, password, phonenumber, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'DELETE FROM users WHERE userid = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
    }

    res.json({ message: 'ลบผู้ใช้เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
};
