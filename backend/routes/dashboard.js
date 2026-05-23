const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get user info
        const [userRows] = await db.execute('SELECT name, email FROM Users WHERE id = ?', [userId]);
        const user = userRows[0] || { name: 'Guest', email: '' };

        // 2. Get user skills
        const [skills] = await db.execute('SELECT skill_name, proficiency FROM User_Skills WHERE user_id = ?', [userId]);

        // 3. Get past interview sessions with scores
        const [interviews] = await db.execute(`
            SELECT 
                s.id, j.title as job_role, s.interview_type, s.status, 
                s.start_time, s.end_time, s.final_score
            FROM Interview_Sessions s
            JOIN Job_Roles j ON s.job_role_id = j.id 
            WHERE s.user_id = ?
            ORDER BY s.start_time DESC
        `, [userId]);

        const [[{ totalInterviews }]] = await db.execute('SELECT COUNT(*) as totalInterviews FROM Interview_Sessions WHERE user_id = ?', [userId]);


        // 4. Get detailed scores for completed interviews
        const [detailedScores] = await db.execute(`
            SELECT 
                sc.session_id, sc.confidence_score, sc.technical_score, 
                sc.communication_score, sc.eye_contact_score, sc.overall_score,
                sc.weak_topics
            FROM Interview_Scores sc
            JOIN Interview_Sessions s ON sc.session_id = s.id
            WHERE s.user_id = ?
            ORDER BY sc.scored_at DESC
            LIMIT 10
        `, [userId]);

        // 5. Get all weak topics across sessions
        const weakTopicsSet = new Set();
        detailedScores.forEach(s => {
            if (s.weak_topics) {
                s.weak_topics.split(/[;,]/).forEach(t => {
                    const trimmed = t.trim();
                    if (trimmed) weakTopicsSet.add(trimmed);
                });
            }
        });

        // 6. Get job roles for dropdown
        const [jobRoles] = await db.execute('SELECT id, title FROM Job_Roles');

        // 7. Get recent logs
        const [logs] = await db.execute('SELECT * FROM Logs ORDER BY created_at DESC LIMIT 10');

        // 8. Get Aptitude tests
        const [aptitudeTests] = await db.execute(`
            SELECT id, category, difficulty, score_percentage as score, 100 as total_qs, 0 as xp_earned, created_at 
            FROM Aptitude_Sessions 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            user,
            skills,
            interviews,
            totalInterviews,
            detailedScores,
            weakTopics: Array.from(weakTopicsSet).slice(0, 10),
            jobRoles,
            logs,
            aptitudeTests

        });

    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

module.exports = router;
