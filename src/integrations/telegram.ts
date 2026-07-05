import fetch from 'node-fetch';
import { config } from '../config';

// Telegram webhook helper (skeleton)
export async function setWebhook(url: string) {
  if (!config.telegramToken) throw new Error('Telegram token not configured');
  const api = `https://api.telegram.org/bot${config.telegramToken}/setWebhook`;
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return res.json();
}

export async function sendMessage(chatId: string | number, text: string) {
  if (!config.telegramToken) throw new Error('Telegram token not configured');
  const api = `https://api.telegram.org/bot${config.telegramToken}/sendMessage`;
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  return res.json();
}
