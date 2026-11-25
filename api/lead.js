// Vercel serverless function: anketadan kelgan ism va raqamni Telegram botga yuboradi.
// Token sayt kodida emas, Vercel'ning yashirin sozlamasida turadi:
//   BOT_TOKEN  — @BotFather bergan token (majburiy)
//   CHAT_ID    — botga /start bosgan odamning raqami; bir nechta bo‘lsa vergul bilan (majburiy)

const NAME_MAX = 60;
const PHONE_RE = /^\+998\d{9}$/;

function tashkentTime(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.day}.${parts.month}.${parts.year} ${parts.hour}:${parts.minute}`;
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (err) { return {}; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const chats = (process.env.CHAT_ID || '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!BOT_TOKEN || !chats.length) {
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const body = readBody(req);
  const name = String(body.name || '').trim().slice(0, NAME_MAX);
  const phone = String(body.phone || '').replace(/\s/g, '');
  if (name.length < 2 || !PHONE_RE.test(phone)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const text = [
    '🔔 Yangi lead keldi',
    '',
    'Ism: ' + name,
    'Telefon: ' + phone,
    'Vaqt: ' + tashkentTime(new Date()),
    'Manba: Olimjon Isxakov darsligi'
  ].join('\n');

  const sent = await Promise.allSettled(chats.map(async (chat_id) => {
    const tg = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text })
    });
    if (!tg.ok) throw new Error('telegram ' + tg.status);
  }));
  sent.filter((r) => r.status === 'rejected').forEach((r) => console.error(r.reason.message));
  if (!sent.some((r) => r.status === 'fulfilled')) return res.status(502).json({ ok: false, error: 'telegram' });
  return res.status(200).json({ ok: true });
};
