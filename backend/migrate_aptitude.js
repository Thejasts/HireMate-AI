const db = require('./db');

async function migrate() {
    try {
        console.log("Starting DB Migration for Aptitude Arena...");

        // 1. Add gamification columns to users if they don't exist
        console.log("Updating users table...");
        try {
            await db.query(`ALTER TABLE users ADD COLUMN xp_points INT DEFAULT 0`);
        } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }
        
        try {
            await db.query(`ALTER TABLE users ADD COLUMN current_streak INT DEFAULT 0`);
        } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        try {
            await db.query(`ALTER TABLE users ADD COLUMN last_active_date DATE NULL`);
        } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

        // 2. Create aptitude_sessions table
        console.log("Creating aptitude_sessions table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS aptitude_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                score_percentage INT DEFAULT 0,
                strengths TEXT,
                weak_areas TEXT,
                improvement_suggestions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 3. Create aptitude_questions table
        console.log("Creating aptitude_questions table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS aptitude_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT NOT NULL,
                question_text TEXT NOT NULL,
                options_json JSON NOT NULL,
                correct_answer VARCHAR(255) NOT NULL,
                user_answer VARCHAR(255),
                is_correct BOOLEAN,
                explanation TEXT,
                FOREIGN KEY (session_id) REFERENCES aptitude_sessions(id) ON DELETE CASCADE
            )
        `);

        console.log("Migration successful.");
        process.exit(0);
    } catch(err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
