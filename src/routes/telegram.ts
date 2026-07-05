import { Router } from 'express';
import { sendMessage } from '../integrations/telegram';

const router = Router();

// Telegram webhook endpoint for messages (basic echo/admin commands)
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    // simple handling: on message -> echo or if /stats -> call admin
    const msg = body.message || body.edited_message;
    if (msg && msg.chat && msg.text) {
      const text = msg.text.trim();
      if (text === '/stats') {
        // Incomplete: for now echo placeholder
        await sendMessage(msg.chat.id, 'Stats are under construction.');
      } else {
        await sendMessage(msg.chat.id, `Echo: ${text}`);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('telegram webhook error', err);
    res.status(500).json({ ok: false });
  }
});

export default router;
