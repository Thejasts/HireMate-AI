const express = require('express');
const router = express.Router();
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const gdApiKey = process.env.GEMINI_GD_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gdApiKey);

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

// POST /api/gd/start
router.post('/start', async (req, res) => {
    try {
        const { user_id } = req.body;

        // Generate a topic
        const topicPrompt = `Generate a realistic group discussion topic for a job interview. It should be thought-provoking and debatable (e.g., "Is Artificial Intelligence replacing human jobs?", "Should social media be regulated?"). Return ONLY the topic string.`;
        const topicResult = await getAIResponseWithFallback(topicPrompt);
        const topic = topicResult.response.text().trim();

        // Save session
        const [sessionRes] = await db.execute(
            'INSERT INTO GD_Sessions (user_id, topic) VALUES (?, ?)',
            [user_id, topic]
        );
        const session_id = sessionRes.insertId;

        // Add Participants
        const participants = [
            { name: 'AI Moderator', role: 'Moderator' },
            { name: 'Participant 1', role: 'Aggressive Speaker' },
            { name: 'Participant 2', role: 'Analytical Speaker' },
            { name: 'Participant 3', role: 'Supportive Speaker' }
        ];

        for (const p of participants) {
            await db.execute(
                'INSERT INTO GD_Participants (session_id, name, role) VALUES (?, ?, ?)',
                [session_id, p.name, p.role]
            );
        }

        // Get Moderator to start
        const startPrompt = `You are an AI Moderator starting a group discussion. The topic is "${topic}". Introduce the topic briefly and invite the participants to start. Return ONLY your spoken text.`;
        const modResult = await getAIResponseWithFallback(startPrompt);
        const modText = modResult.response.text().trim();

        await db.execute(
            'INSERT INTO GD_Messages (session_id, participant_name, message_text) VALUES (?, ?, ?)',
            [session_id, 'AI Moderator', modText]
        );

        res.json({
            session_id,
            topic,
            messages: [{ participant_name: 'AI Moderator', message_text: modText }]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start GD' });
    }
});

// POST /api/gd/message
router.post('/message', async (req, res) => {
    try {
        const { session_id, user_message } = req.body;

        // Save user message
        if (user_message) {
            await db.execute(
                'INSERT INTO GD_Messages (session_id, participant_name, message_text) VALUES (?, ?, ?)',
                [session_id, 'Student', user_message]
            );
        }

        // Get session topic & history
        const [sessionRows] = await db.execute('SELECT topic FROM GD_Sessions WHERE id = ?', [session_id]);
        const topic = sessionRows[0].topic;

        const [msgRows] = await db.execute('SELECT participant_name, message_text FROM GD_Messages WHERE session_id = ? ORDER BY timestamp ASC', [session_id]);
        const history = msgRows.map(m => `${m.participant_name}: ${m.message_text}`).join('\n');

        const prompt = `You are simulating a highly realistic, dynamic group discussion. Topic: "${topic}".
Current transcript:
${history}

There are 3 AI participants and an AI Moderator:
Participant 1: Aggressive Speaker (debates strongly, interrupts others, passionate)
Participant 2: Analytical Speaker (uses facts, logic, structures thoughts, corrects others)
Participant 3: Supportive Speaker (agrees, bridges points, polite but firm)
AI Moderator: Keeps time, directs flow, brings it back to topic if they argue too much.

CRITICAL RULES FOR REALISM:
1. Make it feel like a REAL human conversation. Use filler words (um, well, actually).
2. They should occasionally interrupt the previous speaker if they strongly disagree, instead of waiting politely.
3. If the student (User) hasn't spoken in a while, they should ask the student for their opinion.
4. Keep individual responses EXTREMELY SHORT (1 sentence maximum). This is a fast-paced debate. Do NOT generate long monologues.

Based on the transcript, choose WHICH AI participant(s) should speak next to keep the discussion natural. 
You can generate multiple responses at once to simulate a rapid exchange between different participants (e.g., Participant 1 makes a point, and Participant 2 immediately replies).
Return the response in this exact JSON format:
{
  "responses": [
    { "participant_name": "Participant 1", "message_text": "Actually, I completely disagree with that point..." },
    { "participant_name": "Participant 2", "message_text": "But wait, if you look at the statistics..." }
  ]
}
Return ONLY valid JSON.`;

        const aiResult = await getAIResponseWithFallback(prompt);
        let aiText = aiResult.response.text().trim();
        if (aiText.startsWith('\`\`\`json')) aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        if (aiText.startsWith('\`\`\`')) aiText = aiText.replace(/\`\`\`/g, '').trim();

        const data = JSON.parse(aiText);

        for (const resp of data.responses) {
            await db.execute(
                'INSERT INTO GD_Messages (session_id, participant_name, message_text) VALUES (?, ?, ?)',
                [session_id, resp.participant_name, resp.message_text]
            );
        }

        res.json({ responses: data.responses });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// POST /api/gd/end
router.post('/end', async (req, res) => {
    try {
        const { session_id } = req.body;

        await db.execute('UPDATE GD_Sessions SET status = "Completed", end_time = CURRENT_TIMESTAMP WHERE id = ?', [session_id]);

        const [sessionRows] = await db.execute('SELECT topic FROM GD_Sessions WHERE id = ?', [session_id]);
        const topic = sessionRows[0].topic;

        const [msgRows] = await db.execute('SELECT participant_name, message_text FROM GD_Messages WHERE session_id = ? ORDER BY timestamp ASC', [session_id]);
        const history = msgRows.map(m => `${m.participant_name}: ${m.message_text}`).join('\n');

        const prompt = `You are evaluating a student in a group discussion.
Topic: "${topic}"
Transcript:
${history}

Evaluate the "Student" participant.
Return ONLY valid JSON in this exact format:
{
  "communication_score": 8.5,
  "confidence_score": 7.0,
  "participation_score": 9.0,
  "interaction_level": 8.0,
  "leadership_score": 6.5,
  "strengths": "List of strings",
  "improvement_areas": "List of strings"
}`;

        const aiResult = await getAIResponseWithFallback(prompt);
        let aiText = aiResult.response.text().trim();
        if (aiText.startsWith('\`\`\`json')) aiText = aiText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        if (aiText.startsWith('\`\`\`')) aiText = aiText.replace(/\`\`\`/g, '').trim();

        const data = JSON.parse(aiText);
        const strengths = Array.isArray(data.strengths) ? data.strengths.join(', ') : data.strengths;
        const improvements = Array.isArray(data.improvement_areas) ? data.improvement_areas.join(', ') : data.improvement_areas;

        await db.execute(
            'INSERT INTO GD_Scores (session_id, communication_score, confidence_score, participation_score, interaction_level, leadership_score, strengths, improvement_areas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [session_id, data.communication_score, data.confidence_score, data.participation_score, data.interaction_level, data.leadership_score, strengths, improvements]
        );

        res.json({ report: data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to end GD' });
    }
});

module.exports = router;
