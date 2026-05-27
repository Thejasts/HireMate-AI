-- AI Group Discussion Schema

CREATE TABLE IF NOT EXISTS GD_Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic VARCHAR(500) NOT NULL,
    status ENUM('Active', 'Completed') DEFAULT 'Active',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS GD_Participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (session_id) REFERENCES GD_Sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GD_Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES GD_Sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GD_Scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    communication_score DECIMAL(5,2) DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    participation_score DECIMAL(5,2) DEFAULT 0,
    interaction_level DECIMAL(5,2) DEFAULT 0,
    leadership_score DECIMAL(5,2) DEFAULT 0,
    strengths TEXT,
    improvement_areas TEXT,
    FOREIGN KEY (session_id) REFERENCES GD_Sessions(id) ON DELETE CASCADE
);
