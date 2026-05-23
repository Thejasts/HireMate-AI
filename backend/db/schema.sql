-- AI Career Coach: Database Schema (3NF Normalized)

CREATE DATABASE IF NOT EXISTS ai_career_coach;
USE ai_career_coach;

-- 1. Users Table

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills Table (Master list of all skills)

CREATE TABLE IF NOT EXISTS Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('Programming', 'Framework', 'Database', 'AI/ML', 'Soft Skill', 'DevOps', 'Other') DEFAULT 'Other'
);

-- 3. User_Skills Table (Junction: Users <-> Skills)

CREATE TABLE IF NOT EXISTS User_Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT,
    skill_name VARCHAR(100) NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE SET NULL
);

-- 4. Job_Roles Table (Target roles for students)

CREATE TABLE IF NOT EXISTS Job_Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Required_Skills Table (Skills needed for a job role)

CREATE TABLE IF NOT EXISTS Required_Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_role_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    importance ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    FOREIGN KEY (job_role_id) REFERENCES Job_Roles(id) ON DELETE CASCADE
);

-- 6. Resumes Table

CREATE TABLE IF NOT EXISTS Resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    parsed_text TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 7. Interview_Sessions Table

CREATE TABLE IF NOT EXISTS Interview_Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_role_id INT NOT NULL,
    interview_type ENUM('HR', 'Technical', 'DBMS', 'AIML', 'Coding', 'Custom') DEFAULT 'Technical',
    status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'In Progress',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    final_score DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_role_id) REFERENCES Job_Roles(id) ON DELETE CASCADE
);

-- 8. Interview_Questions Table (Dynamic questions asked by AI)

CREATE TABLE IF NOT EXISTS Interview_Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_text TEXT NOT NULL,
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Interview_Sessions(id) ON DELETE CASCADE
);

-- 9. Interview_Responses Table (Student answers + AI evaluation)

CREATE TABLE IF NOT EXISTS Interview_Responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    student_text_answer TEXT NOT NULL,
    ai_feedback_mistakes TEXT,
    ai_feedback_improvements TEXT,
    score DECIMAL(5,2) DEFAULT 0.00,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES Interview_Questions(id) ON DELETE CASCADE
);

-- 10. Interview_Scores Table (Aggregated per-session scoring)

CREATE TABLE IF NOT EXISTS Interview_Scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    technical_score DECIMAL(5,2) DEFAULT 0.00,
    communication_score DECIMAL(5,2) DEFAULT 0.00,
    eye_contact_score DECIMAL(5,2) DEFAULT 0.00,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    weak_topics TEXT,
    scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Interview_Sessions(id) ON DELETE CASCADE
);

-- 11. Logs Table (System logging for triggers)

CREATE TABLE IF NOT EXISTS Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA

-- Default User for demo
INSERT IGNORE INTO Users (id, name, email, password_hash) VALUES 
(1, 'Thejas TS', 'thejas@example.com', 'demo_hash');

-- Job Roles
INSERT IGNORE INTO Job_Roles (id, title, description) VALUES
(1, 'Software Engineer', 'Develops and maintains software applications using modern tech stacks.'),
(2, 'Data Analyst', 'Analyzes data to derive business insights and build dashboards.'),
(3, 'AI Engineer', 'Builds, trains, and deploys artificial intelligence models.'),
(4, 'DBMS Specialist', 'Designs, manages, and optimizes relational databases.'),
(5, 'Full Stack Developer', 'Works across frontend and backend to build complete web applications.');

-- Required Skills per Role
INSERT IGNORE INTO Required_Skills (job_role_id, skill_name, importance) VALUES
-- Software Engineer
(1, 'JavaScript', 'High'), (1, 'React', 'High'), (1, 'Node.js', 'Medium'),
(1, 'SQL', 'Medium'), (1, 'Git', 'Medium'), (1, 'Data Structures', 'High'),
-- Data Analyst
(2, 'SQL', 'High'), (2, 'Python', 'High'), (2, 'Data Visualization', 'Medium'),
(2, 'Excel', 'Medium'), (2, 'Statistics', 'High'),
-- AI Engineer
(3, 'Python', 'High'), (3, 'Machine Learning', 'High'), (3, 'Deep Learning', 'High'),
(3, 'TensorFlow', 'Medium'), (3, 'NLP', 'Medium'), (3, 'Mathematics', 'High'),
-- DBMS Specialist
(4, 'SQL', 'High'), (4, 'MySQL', 'High'), (4, 'Normalization', 'High'),
(4, 'Stored Procedures', 'Medium'), (4, 'Indexing', 'Medium'),
-- Full Stack Developer
(5, 'JavaScript', 'High'), (5, 'React', 'High'), (5, 'Node.js', 'High'),
(5, 'MongoDB', 'Medium'), (5, 'REST API', 'High'), (5, 'CSS', 'Medium');

-- Master Skills
INSERT IGNORE INTO Skills (skill_name, category) VALUES
('JavaScript', 'Programming'), ('Python', 'Programming'), ('Java', 'Programming'),
('C', 'Programming'), ('C++', 'Programming'), ('HTML', 'Programming'), ('CSS', 'Programming'),
('React', 'Framework'), ('Node.js', 'Framework'), ('Express', 'Framework'),
('Angular', 'Framework'), ('Vue.js', 'Framework'), ('Django', 'Framework'),
('SQL', 'Database'), ('MySQL', 'Database'), ('MongoDB', 'Database'), ('PostgreSQL', 'Database'),
('Machine Learning', 'AI/ML'), ('Deep Learning', 'AI/ML'), ('NLP', 'AI/ML'),
('TensorFlow', 'AI/ML'), ('PyTorch', 'AI/ML'),
('Git', 'DevOps'), ('Docker', 'DevOps'), ('AWS', 'DevOps'),
('Communication', 'Soft Skill'), ('Problem Solving', 'Soft Skill'),
('Data Structures', 'Other'), ('Algorithms', 'Other'),
('Normalization', 'Database'), ('Stored Procedures', 'Database'), ('Indexing', 'Database'),
('Data Visualization', 'Other'), ('Statistics', 'Other'), ('Excel', 'Other'),
('Mathematics', 'Other'), ('REST API', 'Other');
