const OpenAI = require('openai');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function gptrequest(chatId) {
    const chatsData = fs.readFileSync('chats.json');
    let chats = [];
    try {
        // Parse existing JSON data from chats.json
        chats = JSON.parse(chatsData);
    } catch (error) {
        console.error('Error parsing chats.json:', error);
        res.status(500).send('Error parsing conversational chain');
    }

    const conversations = [
        { role : "system", content: "kamu adalah seorang chatbot penasehat agama islam, kamu membantu user dengan menjawab pertanyaannya berdasarkan referensi dari ayat ayat alquran, kamu menjawab user pertama dengan mengucap kata kata salam atau umpatan baik yang ada pada agama islam di setiap response, kemudian menjawab pendapat kamu sebagai penasehat agama islam dan terakhir dibawahnya selalu sertakan referensi surah berapa dan ayat berapa atau hadits yang berkaitan!. Sebagai penasihat agama islam, janganlah menjawab hal diluar bidang kamu, dan gunakan tutur kata yang baik, sopan dan islami. !PENTING! selalu gunakan riwayat konversasi ini sebagai referensi untuk menjawab user selanjutnya."}
    ]

    conversations.push(...chats
        .filter(chat => chat.chatId === chatId)
        .map(chat => ({ role: chat.role, content: chat.content }))
    );
    console.log('conversations', conversations);

const model = process.env.OPENAI_MODEL

    const response = await openai.chat.completions.create({
        model: model,
        messages: conversations,
        // stream: true,
    });
    console.log('response', response)
    console.log('response data', response.data)

    const newChat = {
        chatId: chatId,
        role: "assistant",
        content: response.choices[0].message.content
    };

    chats.push(newChat);
    fs.writeFileSync('chats.json', JSON.stringify(chats, null, 2));

    return response.choices[0].message.content;
}

const app = express();
app.use(express.json())

// const port = process.env.SERVER_PORT;

const fs = require('fs'); // include the filesystem module

app.use(cors())

app.post('/', (req, res) => {
    
    console.log(req.body)
    const body = req.body;

    if (!body || !body.chatId || !body.message) {
        res.status(400).send('Kesalahan pada request body');
        return;
    }

    const chatId = body.chatId;
    // Read chats.json file synchronously
    const chatsData = fs.readFileSync('chats.json');
    let chats = [];
    try {
        // Parse existing JSON data from chats.json
        chats = JSON.parse(chatsData);
    } catch (error) {
        console.error('Error parsing chats.json:', error);
    }

    // Find chats with the given chatId
    const matchingChats = chats.filter(chat => chat.chatId === chatId);
    let conversations = [];

    const newChat = {
        chatId: chatId,
        role: "user",
        content: body.message
    };
    chats.push(newChat);
    fs.writeFileSync('chats.json', JSON.stringify(chats, null, 2));

    conversations.push(newChat.chat);

    const response = gptrequest(chatId)
    .then(response => {
        console.log('reresponse', response)
        res.json(response);
    })
    // console.log('reresponse', response)
    // await res.json(response);

});


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

export default app;