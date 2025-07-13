// telegramBot.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const TOKEN = '7616124601:AAFYi5jvRx9lptIZjeDODmDRYZDulh5J_e0';
const URL = `https://api.telegram.org/bot${TOKEN}`;
const WEB_URL = 'https://randomchatx.vercel.app';

const app = express();
app.use(bodyParser.json());

// 📩 Handle Telegram Messages
app.post('/telegram', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.toLowerCase();

  let reply = '';

  if (text.includes('hi') || text.includes('hello')) {
    reply = '👋 Hi! Welcome to RandomChatX! Start chatting here: ' + WEB_URL;
  } else if (text.includes('tips')) {
    reply = '💡 Tip: Use filters like age/gender to find better matches!';
  } else {
    reply = `🤖 RandomChatX Bot here!\nVisit: ${WEB_URL}`;
  }

  await axios.post(`${URL}/sendMessage`, {
    chat_id: chatId,
    text: reply
  });

  res.sendStatus(200);
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Telegram Bot Server running at http://localhost:${PORT}`);
});
