-- =============================================
-- VILLAGE DATABASE - Complete SQL Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS village_db;
USE village_db;

-- -----------------------------------------------
-- TABLE 1: members (poori details)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(100)  NOT NULL,
  father_name     VARCHAR(100),
  mother_name     VARCHAR(100),
  date_of_birth   DATE,
  age             INT,
  gender          ENUM('Male','Female','Other') NOT NULL,
  marital_status  ENUM('Single','Married','Widowed','Divorced') DEFAULT 'Single',
  mobile          VARCHAR(15),
  alternate_mobile VARCHAR(15),
  email           VARCHAR(100),
  education       VARCHAR(100),
  occupation      VARCHAR(100),
  income          VARCHAR(50),
  blood_group     VARCHAR(5),
  aadhar_no       VARCHAR(20),
  voter_id        VARCHAR(20),
  house_no        VARCHAR(20),
  mohalla         VARCHAR(100),
  village         VARCHAR(100) DEFAULT 'My Village',
  tehsil          VARCHAR(100),
  district        VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(10),
  photo_url       TEXT,
  is_active       TINYINT(1) DEFAULT 1,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- TABLE 2: relations (family tree)
-- -----------------------------------------------
-- relation_type options:
--   father, mother, son, daughter, wife, husband,
--   brother, sister, grandfather, grandmother,
--   grandson, granddaughter, uncle, aunt, nephew, niece
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS relations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  member_id       INT NOT NULL,           -- jis member ki relation hai
  related_id      INT NOT NULL,           -- woh kiska relative hai
  relation_type   VARCHAR(50) NOT NULL,   -- e.g. 'father', 'son', 'wife'
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id)  REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (related_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_relation (member_id, related_id, relation_type)
);

-- -----------------------------------------------
-- TABLE 3: admin users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- store hashed password
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: username=admin, password=admin123 (change this!)
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');

-- -----------------------------------------------
-- SAMPLE DATA (optional - delete if not needed)
-- -----------------------------------------------
INSERT INTO members (full_name, father_name, mother_name, age, gender, marital_status, mobile, occupation, house_no, mohalla, village, district, state) VALUES
('Ramesh Kumar',    'Shyam Lal',    'Devi Devi',   55, 'Male',   'Married', '9876500001', 'Farmer',   'H-1', 'Main Mohalla', 'My Village', 'Ghaziabad', 'Uttar Pradesh'),
('Sunita Devi',     'Hari Ram',     'Kamla Devi',  50, 'Female', 'Married', '9876500002', 'Housewife','H-1', 'Main Mohalla', 'My Village', 'Ghaziabad', 'Uttar Pradesh'),
('Rahul Kumar',     'Ramesh Kumar', 'Sunita Devi', 28, 'Male',   'Single',  '9876500003', 'Student',  'H-1', 'Main Mohalla', 'My Village', 'Ghaziabad', 'Uttar Pradesh'),
('Priya Kumari',    'Ramesh Kumar', 'Sunita Devi', 24, 'Female', 'Single',  '9876500004', 'Teacher',  'H-1', 'Main Mohalla', 'My Village', 'Ghaziabad', 'Uttar Pradesh');

-- Sample relations: Ramesh=1 ki wife Sunita=2, beta Rahul=3, beti Priya=4
INSERT INTO relations (member_id, related_id, relation_type) VALUES
(1, 2, 'wife'),
(1, 3, 'son'),
(1, 4, 'daughter'),
(2, 1, 'husband'),
(2, 3, 'son'),
(2, 4, 'daughter'),
(3, 1, 'father'),
(3, 2, 'mother'),
(3, 4, 'sister'),
(4, 1, 'father'),
(4, 2, 'mother'),
(4, 3, 'brother');
