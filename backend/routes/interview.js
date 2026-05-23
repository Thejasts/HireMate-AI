const express = require('express');
const router = express.Router();
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIResponseWithFallback(promptText, retries = 3) {
    let lastError;
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
    
    for (let modelName of modelsToTry) {
        for (let i = 0; i < retries; i++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                return await model.generateContent(promptText);
            } catch(e) {
                lastError = e;
                if (e.status === 429) {
                    console.warn(`[AI Rate Limit] on ${modelName}. Switching to next model...`);
                    // Small delay to prevent spamming APIs instantly
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    break; // break inner loop, try next model in outer loop
                } else if (e.status === 503) {
                    console.warn(`[AI Overload] Waiting 3s before retry on ${modelName}...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    break; // some other error, break inner loop, try next model
                }
            }
        }
    }
    throw lastError;
}

// POST /api/interview/start - Start a new interview session
router.post('/start', async (req, res) => {
    try {
        const { user_id, job_role_id, interview_type } = req.body;
        
        // Create session with interview_type
        const [result] = await db.execute(
            'INSERT INTO Interview_Sessions (user_id, job_role_id, interview_type) VALUES (?, ?, ?)',
            [user_id, job_role_id, interview_type || 'Technical']
        );
        const session_id = result.insertId;

        // Get Job Role info
        const [roleRows] = await db.execute('SELECT title FROM Job_Roles WHERE id = ?', [job_role_id]);
        const jobTitle = roleRows.length > 0 ? roleRows[0].title : 'General';

        // Get User Skills
        const [skillRows] = await db.execute('SELECT skill_name FROM User_Skills WHERE user_id = ?', [user_id]);
        const userSkills = skillRows.map(row => row.skill_name).join(', ');

        // Get user name
        const [userRows] = await db.execute('SELECT name FROM Users WHERE id = ?', [user_id]);
        const userName = userRows.length > 0 ? userRows[0].name : 'Candidate';

        // Build prompt based on interview type
        const typePrompts = {
            'HR': `You are a professional HR interviewer. Ask behavioral, situational, and culture-fit questions. Start with a warm greeting using the candidate's name "${userName}".`,
            'Technical': `You are a senior technical interviewer. Ask programming, system design, and problem-solving questions relevant to the ${jobTitle} role.`,
            'DBMS': `You are a database expert interviewer. Ask questions about SQL, normalization, ER diagrams, transactions, indexing, stored procedures, triggers, and relational algebra.`,
            'AIML': `You are an AI/ML expert interviewer. Ask questions about machine learning algorithms, deep learning, neural networks, NLP, computer vision, and model evaluation.`,
            'Coding': `You are a coding interview expert. Ask algorithmic and data structure problems. Present a problem statement and ask the candidate to explain their approach.`,
            'Custom': `You are a versatile interviewer. Ask a mix of HR, technical, and domain-specific questions for the ${jobTitle} role.`
        };

        const systemContext = typePrompts[interview_type] || typePrompts['Technical'];

        const prompt = `${systemContext}
        The candidate's name is "${userName}" and they have these skills: ${userSkills || 'not specified yet'}.
        Generate exactly ONE introductory interview question. Be professional and welcoming. Greet the candidate by name.
        Return ONLY the question text, nothing else.`;

        const aiResult = await getAIResponseWithFallback(prompt);
        const firstQuestion = aiResult.response.text().trim();

        // Save question to DB
        const [qResult] = await db.execute(
            'INSERT INTO Interview_Questions (session_id, question_text) VALUES (?, ?)',
            [session_id, firstQuestion]
        );

        res.json({
            session_id,
            question_id: qResult.insertId,
            question_text: firstQuestion,
            user_name: userName
        });
    } catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ error: 'Failed to start interview', details: error.message });
    }
});

// POST /api/interview/analyze-answer
router.post('/analyze-answer', async (req, res) => {
    try {
        const { session_id, question_id, student_text_answer, interview_type } = req.body;

        const [qRows] = await db.execute('SELECT question_text FROM Interview_Questions WHERE id = ?', [question_id]);
        if (qRows.length === 0) return res.status(404).json({ error: 'Question not found' });
        const questionText = qRows[0].question_text;

        // Get previous Q&A for context continuity
        const [historyRows] = await db.execute(`
            SELECT q.question_text, r.student_text_answer 
            FROM Interview_Questions q 
            LEFT JOIN Interview_Responses r ON q.id = r.question_id 
            WHERE q.session_id = ? 
            ORDER BY q.asked_at ASC LIMIT 5`, [session_id]);

        const conversationHistory = historyRows.map(h => 
            `Q: ${h.question_text}\nA: ${h.student_text_answer || '(not answered yet)'}`
        ).join('\n\n');

        const analyzePrompt = `You are an expert ${interview_type || 'Technical'} interviewer conducting a live interview.

Previous conversation:
${conversationHistory}

Current question: "${questionText}"
Student's answer: "${student_text_answer}"

Evaluate this answer carefully. Return a JSON response with EXACTLY this structure (no markdown, no code blocks, raw JSON only):
{
    "mistakes": "List specific technical inaccuracies, missing key points, or weak areas in the answer",
    "improvements": "Concrete suggestions for how to improve this answer. What should they study or practice?",
    "confidence_score": <0-10 based on how confidently they spoke>,
    "technical_score": <0-10 based on technical accuracy>,
    "communication_score": <0-10 based on clarity and structure of answer>,
    "overall_score": <0-10 weighted average>,
    "weak_topics": "Comma-separated list of topics they should improve on",
    "next_question": "Generate the next relevant interview question. It should be a natural follow-up or advance to the next topic."
}`;

        const aiResult = await getAIResponseWithFallback(analyzePrompt);
        let aiText = aiResult.response.text().trim();
        
        // Clean markdown wrapping
        if (aiText.startsWith('```json')) aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        if (aiText.startsWith('```')) aiText = aiText.replace(/```/g, '').trim();
        
        const analysis = JSON.parse(aiText);

        // Save Response to DB (fires trigger automatically)
        await db.execute(
            'INSERT INTO Interview_Responses (question_id, student_text_answer, ai_feedback_mistakes, ai_feedback_improvements, score) VALUES (?, ?, ?, ?, ?)',
            [question_id, student_text_answer, analysis.mistakes, analysis.improvements, analysis.overall_score]
        );

        // Save Next Question to DB
        const [nextQResult] = await db.execute(
            'INSERT INTO Interview_Questions (session_id, question_text) VALUES (?, ?)',
            [session_id, analysis.next_question]
        );

        res.json({
            feedback: {
                mistakes: analysis.mistakes,
                improvements: analysis.improvements,
                confidence_score: analysis.confidence_score,
                technical_score: analysis.technical_score,
                communication_score: analysis.communication_score,
                overall_score: analysis.overall_score,
                weak_topics: analysis.weak_topics
            },
            next_question: {
                question_id: nextQResult.insertId,
                question_text: analysis.next_question
            }
        });
    } catch (error) {
        console.error('Error analyzing answer:', error);
        res.status(500).json({ error: 'Failed to analyze answer', details: error.message });
    }
});

// POST /api/interview/end - End interview and save final scores
router.post('/end', async (req, res) => {
    try {
        const { session_id, eye_contact_score } = req.body;

        // Get all response scores for this session
        const [scores] = await db.execute(`
            SELECT r.score, r.ai_feedback_mistakes 
            FROM Interview_Responses r
            JOIN Interview_Questions q ON r.question_id = q.id
            WHERE q.session_id = ?`, [session_id]);

        if (scores.length === 0) {
            return res.json({ final_score: 0, report: [] });
        }

        const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length;
        const eyeContact = eye_contact_score || 75;

        // Use stored procedure to save final score
        await db.query('CALL save_final_score(?, ?, ?, ?, ?, ?, ?)', [
            session_id,
            avgScore,        // confidence approximation
            avgScore,        // technical
            avgScore,        // communication
            eyeContact,      // eye contact from frontend
            avgScore,        // overall
            scores.map(s => s.ai_feedback_mistakes).join('; ')
        ]);

        // Get the full report using stored procedure
        const [reportRows] = await db.query('CALL generate_performance_report(?)', [session_id]);

        res.json({
            final_score: parseFloat(avgScore.toFixed(2)),
            eye_contact_score: eyeContact,
            total_questions: scores.length,
            report: reportRows[0]
        });
    } catch (error) {
        console.error('Error ending interview:', error);
        res.status(500).json({ error: 'Failed to end interview', details: error.message });
    }
});

// GET /api/interview/report/:sessionId
router.get('/report/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const [rows] = await db.query('CALL generate_performance_report(?)', [sessionId]);
        const reportData = rows[0];
        
        // Get session info
        const [sessionRows] = await db.execute(
            'SELECT final_score, interview_type, start_time, end_time FROM Interview_Sessions WHERE id = ?', [sessionId]
        );

        // Get detailed scores
        const [scoreRows] = await db.execute(
            'SELECT * FROM Interview_Scores WHERE session_id = ?', [sessionId]
        );
        
        res.json({
            session: sessionRows[0] || {},
            scores: scoreRows[0] || {},
            report: reportData
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;
