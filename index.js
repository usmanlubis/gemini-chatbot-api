import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

function extractText(resp) {
	try {
		const text =
			resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
			resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
			resp?.response?.candidates?.[0]?.content?.text;

		return text ?? JSON.stringify(resp, null, 2);
	} catch (err) {
		console.error('Error extracting text:', err);
		return JSON.stringify(resp, null, 2);
	}
}

app.post('/api/chat', async (req, res) => {
	try {
		const { messages } = req.body;
		if (!Array.isArray(messages) || messages.length === 0) {
			throw new Error('Messages array is required');
		}

		const contents = messages.map((msg) => ({
			role: msg.role,
			parts: [{ text: msg.content }],
		}));

		const resp = await ai.models.generateContent({
			model: GEMINI_MODEL,
			contents,
		});

		res.json({
			result: extractText(resp),
		});
	} catch (err) {
		console.error('Error:', err);
		res.status(500).send('Internal Server Error');
	}
});
