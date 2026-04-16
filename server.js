// =============================================
// VILLAGE DATABASE - Node.js Backend (server.js)
// =============================================
require('dotenv').config();
const express    = require('express');
const mysql      = require('mysql2');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------
// MySQL Connection
// -----------------------------------------------
const db = mysql.createConnection({
  host:     process.env.MYSQLHOST     || 'mysql-huyu.railway.internal',
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || 'lZoIZPRQgbyaGDQZilpDUMefoBAjJtiN',
  database: process.env.MYSQLDATABASE || 'village_db',
  port:     process.env.MYSQLPORT     || 3306
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL Connected to village_db!');
});

// =============================================
// ROUTES: Serve HTML pages
// =============================================
app.get('/',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'public', 'search.html')));

// =============================================
// API 1: MEMBERS — CRUD
// =============================================

// GET all members (with optional search + limit for AI bot)
app.get('/api/members', (req, res) => {
  const { search, gender, village, limit } = req.query;
  let sql = 'SELECT * FROM members WHERE is_active = 1';
  const params = [];

  if (search) {
    sql += ' AND (full_name LIKE ? OR mobile LIKE ? OR father_name LIKE ? OR house_no LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (gender)  { sql += ' AND gender = ?';  params.push(gender); }
  if (village) { sql += ' AND village = ?'; params.push(village); }

  sql += ' ORDER BY full_name ASC';

  if (limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows, total: rows.length });
  });
});

// GET single member by ID
app.get('/api/members/:id', (req, res) => {
  db.query('SELECT * FROM members WHERE id = ? AND is_active = 1', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: rows[0] });
  });
});

// =============================================
// API 1-A: SAAS-SASUR — Pati ke ID se maa-baap
// URL: GET /api/members/:id/parents
// Use: Ladki registration form mein pati select karne pe
// =============================================
app.get('/api/members/:id/parents', (req, res) => {
  const memberId = req.params.id;

  // Pehle member ki khud ki details lo
  const memberQuery = `
    SELECT id, full_name, father_name, mother_name, gender, Bakhali, village
    FROM members
    WHERE id = ? AND is_active = 1
  `;

  db.query(memberQuery, [memberId], (err, memberResult) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!memberResult.length) return res.status(404).json({ success: false, error: 'Member nahi mila' });

    const member = memberResult[0];

    // Relations table se bhi parents dhundho
    const relationsQuery = `
      SELECT m.id, m.full_name, m.mobile, m.gender, r.relation_type
      FROM relations r
      JOIN members m ON m.id = r.related_id
      WHERE r.member_id = ?
        AND r.relation_type IN ('father', 'mother')
        AND m.is_active = 1
    `;

    db.query(relationsQuery, [memberId], (err2, relResults) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      res.json({
        success: true,
        member: {
          id: member.id,
          full_name: member.full_name,
          gender: member.gender,
          Bakhali: member.Bakhali,
          village: member.village
        },
        // Direct columns se (father_name, mother_name)
        father_name_direct: member.father_name || null,
        mother_name_direct: member.mother_name || null,
        // Relations table se linked members
        relations_parents: relResults
      });
    });
  });
});

// =============================================
// API 1-B: NAAM SE SEARCH — AI Bot ke liye
// URL: GET /api/members/search-by-name?name=Ram Kumar
// =============================================
app.get('/api/search-by-name', (req, res) => {
  const name = req.query.name || '';
  if (!name) return res.status(400).json({ success: false, error: 'Name do' });

  const sql = `
    SELECT id, full_name, father_name, mother_name, spouse_name,
           mobile, gender, age, Bakhali, village, occupation,
           marital_status, blood_group, education
    FROM members
    WHERE (full_name LIKE ? OR father_name LIKE ? OR spouse_name LIKE ?)
      AND is_active = 1
    LIMIT 5
  `;

  db.query(sql, [`%${name}%`, `%${name}%`, `%${name}%`], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
});

// POST add new member
app.post('/api/members', (req, res) => {
  const {
    full_name, father_name, mother_name, date_of_birth, age, gender,
    marital_status, mobile, alternate_mobile, email, education,
    occupation, income, blood_group, aadhar_no, voter_id,
    house_no, Bakhali, village, tehsil, district, state, pincode,
    photo_url, notes
  } = req.body;

  if (!full_name || !gender) {
    return res.status(400).json({ success: false, error: 'full_name aur gender zaroori hai!' });
  }

  const sql = `INSERT INTO members 
    (full_name, father_name, mother_name, date_of_birth, age, gender,
     marital_status, mobile, alternate_mobile, email, education,
     occupation, income, blood_group, aadhar_no, voter_id,
     house_no, Bakhali, village, tehsil, district, state, pincode,
     photo_url, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const values = [
    full_name, father_name, mother_name, date_of_birth || null, age,
    gender, marital_status, mobile, alternate_mobile, email, education,
    occupation, income, blood_group, aadhar_no, voter_id,
    house_no, Bakhali, village || 'Kotar', tehsil, district, state, pincode,
    photo_url, notes
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Member add ho gaya!', id: result.insertId });
  });
});

// PUT update member
app.put('/api/members/:id', (req, res) => {
  const allowedFields = [
    'full_name','father_name','mother_name','date_of_birth','age','gender',
    'marital_status','mobile','alternate_mobile','email','education',
    'occupation','income','blood_group','aadhar_no','voter_id',
    'house_no','Bakhali','village','tehsil','district','state','pincode',
    'photo_url','notes','is_active'
  ];

  const updates = {};
  allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: 'Kuch update karne ke liye data do!' });
  }

  db.query('UPDATE members SET ? WHERE id = ?', [updates, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Member nahi mila' });
    res.json({ success: true, message: 'Member update ho gaya!' });
  });
});

// DELETE member (soft delete)
app.delete('/api/members/:id', (req, res) => {
  db.query('UPDATE members SET is_active = 0 WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Member nahi mila' });
    res.json({ success: true, message: 'Member delete ho gaya!' });
  });
});

// =============================================
// API 2: RELATIONS — Family Tree
// =============================================

// GET all relations of a member
app.get('/api/members/:id/relations', (req, res) => {
  const sql = `
    SELECT 
      r.id           AS relation_id,
      r.relation_type,
      r.notes        AS relation_notes,
      m.id, m.full_name, m.age, m.gender,
      m.mobile, m.occupation, m.photo_url,
      m.house_no, m.Bakhali
    FROM relations r
    JOIN members m ON m.id = r.related_id
    WHERE r.member_id = ? AND m.is_active = 1
    ORDER BY r.relation_type
  `;
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// POST add relation
app.post('/api/relations', (req, res) => {
  const { member_id, related_id, relation_type, notes } = req.body;

  if (!member_id || !related_id || !relation_type) {
    return res.status(400).json({ success: false, error: 'member_id, related_id, relation_type zaroori hai!' });
  }
  if (member_id == related_id) {
    return res.status(400).json({ success: false, error: 'Ek member apna khud ka relative nahi ho sakta!' });
  }

  const sql = 'INSERT INTO relations (member_id, related_id, relation_type, notes) VALUES (?,?,?,?)';
  db.query(sql, [member_id, related_id, relation_type, notes], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, error: 'Yeh relation pehle se exist karta hai!' });
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Relation add ho gaya!', id: result.insertId });
  });
});

// DELETE relation
app.delete('/api/relations/:id', (req, res) => {
  db.query('DELETE FROM relations WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Relation nahi mila' });
    res.json({ success: true, message: 'Relation remove ho gaya!' });
  });
});

// =============================================
// API 3: STATS — Dashboard ke liye
// =============================================
app.get('/api/stats', (req, res) => {
  const queries = {
    total:    'SELECT COUNT(*) as count FROM members WHERE is_active=1',
    male:     'SELECT COUNT(*) as count FROM members WHERE gender="Male" AND is_active=1',
    female:   'SELECT COUNT(*) as count FROM members WHERE gender="Female" AND is_active=1',
    married:  'SELECT COUNT(*) as count FROM members WHERE marital_status="Married" AND is_active=1',
    Bakhalis: 'SELECT Bakhali, COUNT(*) as count FROM members WHERE is_active=1 GROUP BY Bakhali ORDER BY count DESC'
  };

  const results = {};
  const keys = Object.keys(queries);
  let done = 0;

  keys.forEach(key => {
    db.query(queries[key], (err, rows) => {
      if (!err) {
        results[key] = key === 'Bakhalis' ? rows : rows[0].count;
      }
      if (++done === keys.length) {
        res.json({ success: true, data: results });
      }
    });
  });
});

// =============================================
// API 4: ADMIN LOGIN
// =============================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Username ya password galat hai!' });
    res.json({ success: true, message: 'Login successful!', user: rows[0].username });
  });
});

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Village Database Server chal raha hai!`);
  console.log(`📌 Open: http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin\n`);
});
