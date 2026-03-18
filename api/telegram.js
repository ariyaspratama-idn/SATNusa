const fetch = require('node-fetch'); // Native fetch available in recent Node versions, but just in case we use node-fetch or native global fetch if later.
// wait, Vercel supports standard 'fetch' globally since Node 18, so we don't need to require external node-fetch.

async function sendTelegramMessage(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set.');
    return;
  }
  if (!chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
        console.error('Telegram API Error:', await response.text());
    }
  } catch (err) {
    console.error('Telegram Service Exception:', err);
  }
}

// If this file is called directly via Vercel /api/telegram (like a webhook)
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const body = req.body || {};
        // Handle webhook if needed in future, e.g. replying to '/myid'
        if (body.message && body.message.text === '/myid') {
            await sendTelegramMessage(body.message.chat.id, `ID Telegram Anda adalah: <code>${body.message.chat.id}</code>`);
        }
        res.status(200).json({ status: true });
    } else {
        res.status(200).send('Telegram Service Running');
    }
};

module.exports.sendTelegramMessage = sendTelegramMessage;
