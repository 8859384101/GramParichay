# 🏘️ GramParichay — ग्राम परिचय

> A complete Village Members Database System with Family Relations, Admin Panel, and Public Search.

![Node.js](https://img.shields.io/badge/Node.js-v24-green?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📸 Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| 📝 Registration Form | `/` | Public member registration |
| 🔍 Member Search | `/search` | Search any member by name/mobile |
| 🔐 Admin Panel | `/admin` | Full CRUD + Relations management |

---

## ✨ Features

- ✅ **Member Registration** — Public form for self-registration
- ✅ **Family Relations** — father, mother, son, daughter, wife, husband, brother, sister and more
- ✅ **Admin Panel** — View, Edit, Delete members with login protection
- ✅ **Public Search** — Anyone can search members by name, mobile, or father's name
- ✅ **Dashboard Stats** — Total members, male/female count, mohalla-wise breakdown
- ✅ **200 Sample Members** — Ready-to-use realistic Indian village data
- ✅ **Hindi UI** — Full Hindi language interface

---

## 🗂️ Project Structure

```
GramParichay/
├── server.js              ← Node.js + Express backend
├── package.json           ← npm dependencies
├── database.sql           ← MySQL schema (tables + admin setup)
├── sample_data_200.sql    ← 200 sample members with relations
├── README.md              ← This file
└── public/
    ├── index.html         ← Member registration form
    ├── search.html        ← Public search page
    └── admin.html         ← Admin panel (login required)
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or above
- [MySQL](https://dev.mysql.com/downloads/mysql/) 8.0

---

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/GramParichay.git
cd GramParichay
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Setup MySQL Database
Open **MySQL Workbench**, run `database.sql`:
```sql
-- Creates village_db database with 3 tables:
-- members, relations, admins
```

### Step 4 — Configure database password
Edit `server.js` line ~18:
```javascript
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'YOUR_MYSQL_PASSWORD',  // <-- Change this
  database: 'village_db'
});
```

### Step 5 — (Optional) Load sample data
Run `sample_data_200.sql` in MySQL Workbench to load 200 sample village members with family relations.

### Step 6 — Start the server
```bash
node server.js
```

**Output:**
```
✅ MySQL Connected to village_db!
🚀 Village Database Server chal raha hai!
📌 Open: http://localhost:3000
```

---

## 🔌 API Endpoints

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/members` | Get all members (supports `?search=` & `?gender=`) |
| `GET` | `/api/members/:id` | Get single member |
| `POST` | `/api/members` | Add new member |
| `PUT` | `/api/members/:id` | Update member |
| `DELETE` | `/api/members/:id` | Soft delete member |

### Relations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/members/:id/relations` | Get all family relations |
| `POST` | `/api/relations` | Add new relation |
| `DELETE` | `/api/relations/:id` | Remove relation |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/login` | Admin login |

---

## 👨‍👩‍👧 Supported Family Relations

```
father      mother      son         daughter
husband     wife        brother     sister
grandfather grandmother grandson    granddaughter
uncle       aunt        nephew      niece      cousin
```

---

## 🗄️ Database Schema

```sql
members    — Full member details (25+ fields)
relations  — Family tree connections
admins     — Admin login credentials
```

**Member fields include:**
`full_name, father_name, mother_name, date_of_birth, age, gender, marital_status, blood_group, mobile, email, education, occupation, income, aadhar_no, voter_id, house_no, mohalla, village, district, state` and more.

---

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```
> ⚠️ Change these in production!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | MySQL 8.0 |
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| Fonts | Google Fonts (Poppins + Tiro Devanagari Hindi) |

---

## 📋 Sample Data Includes

- **200 Members** across 40+ families
- **14 Mohallas** — Purana, Naya, Brahman Tola, Dalit Basti, Nishad Basti, Bazar, Patel Tola, Rajput Mohalla, etc.
- **400+ Relations** — husband-wife, parent-child, siblings, and cross-family marriages
- **Diverse Occupations** — Farmer, Teacher, Doctor, IPS Officer, CA, Advocate, Weaver, Fisherman, Potter, and more
- **Age Range** — 4 years to 89 years

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

Made with ❤️ for village community management.

> *"हर गाँव की अपनी पहचान — GramParichay"*
