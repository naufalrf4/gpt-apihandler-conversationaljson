const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function gptrequest(chatId, userMessage) {
    const conversations = [
        { role: "system", content: "kamu adalah seorang chatbot penasehat agama islam, ..." },
        { role: "user", content: userMessage },
    ];

    const model = process.env.OPENAI_MODEL;

    const response = await openai.chat.completions.create({
        model: model,
        messages: conversations,
    });

    return response.choices[0].message.content;
}

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', async (req, res) => {
    const body = req.body;

    if (!body || !body.chatId || !body.message) {
        res.status(400).send('Kesalahan pada request body');
        return;
    }

    const chatId = body.chatId;
    const userMessage = body.message;

    const response = await gptrequest(chatId, userMessage);
    
    console.log('ChatId:', chatId);
    console.log('User Message:', userMessage);
    console.log('OpenAI Response:', response);

    res.json({ content: response });
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
