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
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    break;
                } else if (e.status === 503) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    break;
                }
            }
        }
    }
    throw lastError;
}

// POST /api/aptitude/generate
router.post('/generate', async (req, res) => {
    try {
        const { category, difficulty, limit = 5 } = req.body;
        
        const prompt = `You are an expert career coach and aptitude test creator. Generate exactly ${limit} multiple choice questions for a "${category}" assessment at a "${difficulty}" difficulty level.
        Return ONLY a valid JSON array of objects, with NO markdown formatting, NO backticks, and NO extra text.
        Format of each object:
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Exact string of the correct option",
          "explanation": "Brief explanation of why this is correct"
        }`;

        const result = await getAIResponseWithFallback(prompt);
        let rawText = result.response.text().trim();
        if (rawText.startsWith('```json')) {
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/```/g, '').trim();
        }
        
        const questions = JSON.parse(rawText);
        res.json({ questions });
    } catch (err) {
        console.error("Error generating aptitude questions:", err);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// POST /api/aptitude/submit
router.post('/submit', async (req, res) => {
    try {
        const { user_id = 1, category, difficulty, questions, answers } = req.body;

        let correctCount = 0;
        const evaluatedQuestions = questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === q.correctAnswer;
            if (isCorrect) correctCount++;
            return {
                ...q,
                userAnswer: userAns,
                isCorrect
            };
        });

        const scorePercentage = Math.round((correctCount / questions.length) * 100);

        // Generate feedback using AI
        const feedbackPrompt = `A user just completed an aptitude test in "${category}" at "${difficulty}" level.
        They scored ${correctCount} out of ${questions.length} (${scorePercentage}%).
        Here are the questions and their correctness:
        ${JSON.stringify(evaluatedQuestions.map(q => ({ q: q.question, isCorrect: q.isCorrect })))}
        
        Provide a brief analysis in valid JSON format:
        {
           "strengths": "1-2 sentences about what they did well",
           "weakAreas": "1-2 sentences about what they struggled with",
           "improvementSuggestions": "2-3 actionable tips to improve"
        }
        Return ONLY valid JSON, no markdown formatting.`;

        let feedback = { strengths: "Good effort.", weakAreas: "Needs practice.", improvementSuggestions: "Keep practicing." };
        try {
            const result = await getAIResponseWithFallback(feedbackPrompt);
            let rawText = result.response.text().trim();
            if (rawText.startsWith('```json')) rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            if (rawText.startsWith('```')) rawText = rawText.replace(/```/g, '').trim();
            feedback = JSON.parse(rawText);
        } catch (aiErr) {
            console.error("Failed to generate AI feedback:", aiErr);
        }

        // Save to DB
        const [sessionResult] = await db.query(
            `INSERT INTO aptitude_sessions (user_id, category, difficulty, score_percentage, strengths, weak_areas, improvement_suggestions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, category, difficulty, scorePercentage, feedback.strengths, feedback.weakAreas, feedback.improvementSuggestions]
        );

        const sessionId = sessionResult.insertId;

        // Save questions
        for (const q of evaluatedQuestions) {
            await db.query(
                `INSERT INTO aptitude_questions (session_id, question_text, options_json, correct_answer, user_answer, is_correct, explanation)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [sessionId, q.question, JSON.stringify(q.options), q.correctAnswer, q.userAnswer, q.isCorrect, q.explanation]
            );
        }

        // Update gamification (XP and Streak)
        let xpGained = correctCount * 10;
        if (scorePercentage === 100) xpGained += 50;

        await db.query(
            `UPDATE users SET xp_points = xp_points + ?, current_streak = current_streak + 1, last_active_date = CURRENT_DATE WHERE id = ?`,
            [xpGained, user_id]
        );

        const [userRows] = await db.query(`SELECT xp_points, current_streak FROM users WHERE id = ?`, [user_id]);

        res.json({
            success: true,
            sessionId,
            scorePercentage,
            correctCount,
            totalCount: questions.length,
            xpGained,
            totalXP: userRows[0].xp_points,
            currentStreak: userRows[0].current_streak,
            feedback,
            evaluatedQuestions
        });

    } catch (err) {
        console.error("Error submitting aptitude test:", err);
        res.status(500).json({ error: 'Failed to submit test' });
    }
});

module.exports = router;
