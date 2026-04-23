const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { systemPrompt } = require('./prompt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const port = process.env.PORT || 3000;

// Initialize Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Construct the prompt with system instructions
        const chatMessages = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatMessages,
            config: {
                systemInstruction: systemPrompt
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate response. Check your API key and network connection.' });
    }
});

app.listen(port, () => {
    console.log(`EasyCode backend running at http://localhost:${port}`);
});
