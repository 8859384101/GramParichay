// =====================================================
// YE CODE APNE server.js MEIN ADD KARO
// =====================================================
// 
// 1. SAAS-SASUR API - Pati ke naam se maa-baap dhundhna
// 2. Members search with limit
// =====================================================


// -------------------------------------------------------
// API 1: Pati ke naam se uske maa-baap dhundho (Saas-Sasur)
// URL: GET /api/members/:id/parents
// Use: Ladki registration form mein pati select karne pe
// -------------------------------------------------------
app.get('/api/members/:id/parents', (req, res) => {
  const memberId = req.params.id;
  
  // Pehle member ki details lo (father_name, mother_name direct column se)
  const memberQuery = `
    SELECT id, full_name, father_name, mother_name, gender, Bakhali, village
    FROM members 
    WHERE id = ? AND is_deleted = 0
  `;
  
  db.query(memberQuery, [memberId], (err, memberResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!memberResult.length) return res.status(404).json({ error: 'Member nahi mila' });
    
    const member = memberResult[0];
    
    // Relations table se bhi parents dhundho
    const relationsQuery = `
      SELECT m.id, m.full_name, m.mobile, m.gender, r.relation_type
      FROM relations r
      JOIN members m ON m.id = r.related_member_id
      WHERE r.member_id = ? 
        AND r.relation_type IN ('father', 'mother')
        AND m.is_deleted = 0
    `;
    
    db.query(relationsQuery, [memberId], (err2, relResults) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      // Dono sources se data combine karo
      const parents = {
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
        // Relations table se
        relations_parents: relResults
      };
      
      res.json(parents);
    });
  });
});


// -------------------------------------------------------
// API 2: Naam se member search karo (AI bot ke liye)
// URL: GET /api/members/search-by-name?name=Ram Kumar
// -------------------------------------------------------
app.get('/api/members/search-by-name', (req, res) => {
  const name = req.query.name || '';
  
  const query = `
    SELECT id, full_name, father_name, mother_name, spouse_name,
           mobile, gender, age, Bakhali, village, occupation,
           marital_status, blood_group
    FROM members 
    WHERE (full_name LIKE ? OR father_name LIKE ?) 
      AND is_deleted = 0
    LIMIT 5
  `;
  
  db.query(query, [`%${name}%`, `%${name}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// -------------------------------------------------------
// API 3: Members list with limit (AI bot ke liye)
// URL: GET /api/members?limit=50
// Note: Ye existing /api/members mein limit add karna hai
// Apne existing GET /api/members route mein ye change karo:
// -------------------------------------------------------
// EXISTING ROUTE MEIN YE CHANGE KARO:
/*
app.get('/api/members', (req, res) => {
  const search = req.query.search || '';
  const gender = req.query.gender || '';
  const limit = parseInt(req.query.limit) || 100;  // <-- YE ADD KARO
  
  let query = `SELECT * FROM members WHERE is_deleted = 0`;
  let params = [];
  
  if (search) {
    query += ` AND (full_name LIKE ? OR father_name LIKE ? OR mobile LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (gender) {
    query += ` AND gender = ?`;
    params.push(gender);
  }
  
  query += ` ORDER BY id DESC LIMIT ?`;  // <-- YE ADD KARO
  params.push(limit);                      // <-- YE ADD KARO
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
*/


// =====================================================
// FRONTEND CODE - index.html mein add karo
// Pati select karne pe Saas-Sasur auto-fill
// =====================================================

/*
Apni index.html mein Pati wale dropdown ke neeche ye add karo:

<!-- Pati Select -->
<select id="pati-select" name="spouse_id" onchange="loadSaasSasur(this.value)">
  <option value="">-- Pati ka naam select karein --</option>
  <!-- JS se load hoga -->
</select>

<!-- Saas Sasur Auto-fill (readonly) -->
<div id="saas-sasur-section" style="display:none; background:#f0f8ee; padding:12px; border-radius:8px; margin-top:10px; border:1px solid #b8e0b0;">
  <p style="font-weight:600; color:#2d5a27; margin:0 0 8px;">🏠 Saas-Sasur (Auto-filled)</p>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
    <div>
      <label>Sasur ka Naam</label>
      <input type="text" id="sasur-naam" readonly placeholder="Auto-fill hoga..." style="background:#e8f5e9;"/>
    </div>
    <div>
      <label>Saas ka Naam</label>
      <input type="text" id="saas-naam" readonly placeholder="Auto-fill hoga..." style="background:#e8f5e9;"/>
    </div>
  </div>
</div>

<!-- JavaScript -->
<script>
// Page load pe pati dropdown fill karo (sirf male members)
async function loadMaleMembers() {
  const res = await fetch('/api/members?gender=पुरुष');
  const members = await res.json();
  const select = document.getElementById('pati-select');
  members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.full_name + (m.Bakhali ? ' (' + m.Bakhali + ')' : '');
    select.appendChild(opt);
  });
}

// Pati select karne pe saas-sasur load karo
async function loadSaasSasur(patiId) {
  if (!patiId) {
    document.getElementById('saas-sasur-section').style.display = 'none';
    return;
  }
  
  const res = await fetch('/api/members/' + patiId + '/parents');
  const data = await res.json();
  
  // Sasur (father)
  let sasurNaam = data.father_name_direct || '';
  if (!sasurNaam && data.relations_parents) {
    const father = data.relations_parents.find(p => p.relation_type === 'father');
    if (father) sasurNaam = father.full_name;
  }
  
  // Saas (mother)
  let saasNaam = data.mother_name_direct || '';
  if (!saasNaam && data.relations_parents) {
    const mother = data.relations_parents.find(p => p.relation_type === 'mother');
    if (mother) saasNaam = mother.full_name;
  }
  
  document.getElementById('sasur-naam').value = sasurNaam || 'Nahi mila';
  document.getElementById('saas-naam').value = saasNaam || 'Nahi mila';
  document.getElementById('saas-sasur-section').style.display = 'block';
}

// Page load pe chalao
loadMaleMembers();
</script>
*/
