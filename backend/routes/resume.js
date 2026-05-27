const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Security: Strict file validation
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Sanitize file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/msword' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf, .doc, and .docx formats are allowed!'), false);
        }
    }
});

// POST /api/resume/upload - Upload, extract skills, calculate gap
router.post('/upload', upload.single('resume'), async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { user_id, job_role_id } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'No valid file uploaded. Must be PDF/DOC/DOCX under 5MB.' });

        // 1. Read PDF
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        const parsedText = data.text;

        // 2. Save resume to DB
        await connection.execute(
            'INSERT INTO Resumes (user_id, file_path, parsed_text) VALUES (?, ?, ?)',
            [user_id, file.path, parsedText.substring(0, 5000)]
        );

        // 3. Extract skills using Gemini
        const prompt = `
        First, determine if the following text appears to be a resume or CV. If it is completely unrelated to a resume (like a random book, system log, code snippet, or essay), return this exact JSON and nothing else:
        { "is_resume": false }

        If it is a resume, extract a list of technical skills, programming languages, frameworks, tools, and technologies from the following resume text.
        Also extract: education details, project names.
        Return a JSON object with this structure (no markdown, raw JSON):
        {
            "is_resume": true,
            "skills": ["skill1", "skill2", ...],
            "education": "extracted education info",
            "projects": ["project1", "project2", ...]
        }
        Resume Text: ${parsedText.substring(0, 4000)}
        `;

        async function getAIResponseWithFallback(promptText, retries = 2) {
            let lastError;
            for (let i = 0; i < retries; i++) {
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    return await model.generateContent(promptText);
                } catch(e) {
                    lastError = e;
                    if (e.status === 429) {
                        console.warn(`[AI Rate Limit] Waiting 15s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 15000));
                    } else if (e.status === 503) {
                        console.warn(`[AI Overload] Waiting 3s before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } else {
                        break; // Other error, don't retry
                    }
                }
            }
            throw lastError;
        }

        const aiResult = await getAIResponseWithFallback(prompt);
        let aiText = aiResult.response.text().trim();
        if (aiText.startsWith('```json')) aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        if (aiText.startsWith('```')) aiText = aiText.replace(/```/g, '').trim();
        
        const extracted = JSON.parse(aiText);
        
        if (extracted.is_resume === false) {
            return res.status(400).json({ error: 'Uploaded document does not appear to be a valid resume.' });
        }

        const extractedSkills = extracted.skills || [];

        // 4. Save User Skills (Transaction)
        await connection.execute('DELETE FROM User_Skills WHERE user_id = ?', [user_id]);
        for (const skill of extractedSkills) {
            await connection.execute(
                'INSERT INTO User_Skills (user_id, skill_name) VALUES (?, ?)',
                [user_id, skill]
            );
        }

        // Commit transaction
        await connection.commit();

        // 5. Calculate Skill Gap using Stored Procedure (cursor-based)
        const [gapRows] = await db.query('CALL calculate_skill_gap(?, ?)', [user_id, job_role_id]);
        const missingSkills = gapRows[0]; // First result set: missing skills
        const gapStats = gapRows[1] ? gapRows[1][0] : { gap_percentage: 0 }; // Second result set: gap stats

        // 6. Generate Learning Roadmap using Gemini
        const missingList = missingSkills.map(s => s.skill_name).join(', ');
        let roadmap = [];
        if (missingList) {
            const roadmapPrompt = `
            A student is missing these skills for a job role: ${missingList}.
            Create a learning roadmap with recommended video courses to help them learn these skills.
            Return a JSON array (no markdown, raw JSON):
            [
                { 
                  "skill": "skill_name", 
                  "resources": "Top video course or YouTube playlist name", 
                  "video_link": "A realistic YouTube search link like 'https://www.youtube.com/results?search_query=learn+skill_name'",
                  "timeframe": "e.g. 2 weeks", 
                  "priority": "High/Medium/Low" 
                }
            ]
            `;
            try {
                const roadmapResult = await getAIResponseWithFallback(roadmapPrompt);
                let roadmapText = roadmapResult.response.text().trim();
                if (roadmapText.startsWith('```json')) roadmapText = roadmapText.replace(/```json/g, '').replace(/```/g, '').trim();
                if (roadmapText.startsWith('```')) roadmapText = roadmapText.replace(/```/g, '').trim();
                roadmap = JSON.parse(roadmapText);
            } catch (roadmapError) {
                console.error("Roadmap generation skipped due to API limits:", roadmapError.message);
                roadmap = []; // Fallback to empty roadmap so the whole request doesn't crash
            }
        }

        res.json({
            message: 'Resume processed successfully',
            extractedSkills,
            education: extracted.education || '',
            projects: extracted.projects || [],
            missingSkills,
            gapPercentage: gapStats.gap_percentage || 0,
            totalRequired: gapStats.total_required || 0,
            totalMissing: gapStats.total_missing || 0,
            roadmap
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error processing resume:', error);
        res.status(500).json({ error: 'Failed to process resume', details: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
