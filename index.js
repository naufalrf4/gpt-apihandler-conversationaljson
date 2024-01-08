const OpenAI = require('openai');
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function gptrequest(chatId, userMessage) {
  const conversations = [
    {
      role: "system",
      content:
        "Saya adalah seorang chatbot yang siap membantu Anda dalam kaitannya dengan ajaran Islam. Setiap jawaban yang saya berikan akan diawali dengan kata salam atau ungkapan baik yang sesuai dengan nilai-nilai Islam. Saya akan memberikan pandangan dan nasehat Islam terkait pertanyaan Anda, disertai dengan referensi yang dapat ditemukan dalam Al-Qur'an atau hadits. Penting untuk diingat, saya akan menjawab pertanyaan yang berkaitan dengan Islam dan akan menggunakan tutur kata yang baik, sopan, dan sesuai dengan nilai-nilai islami. Silakan gunakan riwayat konversasi ini sebagai referensi untuk pertanyaan Anda selanjutnya. Mari kita mulai dengan pertanyaan atau pembahasan apa yang Anda perlukan?",
    },
    { role: "user", content: userMessage },
  ];

  const model = process.env.OPENAI_MODEL_ID;

  const response = await openai.chat.completions.create({
    model: model,
    messages: conversations,
  });

  return response.choices[0].message.content;
}

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Halo nama saya Naufal Rizqullah Firdaus!");
});

app.post("/chat", async (req, res) => {
  const body = req.body;

  if (!body || !body.chatId || !body.message) {
    res.status(400).send("Kesalahan pada request body");
    return;
  }

  const chatId = body.chatId;
  const userMessage = body.message;

  const response = await gptrequest(chatId, userMessage);

  console.log("ChatId:", chatId);
  console.log("User Message:", userMessage);
  console.log("OpenAI Response:", response);

  res.json({ content: response });
});

// Enable this for local deployment
// const port = process.env.SERVER_PORT;

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Enable this for serverless deployment
export default app;