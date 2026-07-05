import { Router } from 'express';
import { config } from '../config';
import { initPayment, handleWebhook } from '../services/flutterwave';
import { query } from '../db';

const router = Router();

// Initialize a Flutterwave payment (sandbox or real depending on env)
router.post('/flutterwave/init', async (req, res) => {
  try {
    const { amount, currency = 'USD', customer } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'amount required' });

    const tx_ref = `ccg_${Date.now()}`;
    const r = await initPayment({ amount, currency, customer, tx_ref });

    const link = r?.data?.link || r?.data?.meta?.authorization?.redirect || r?.data?.authorization_url || r?.data?.link;

    await query('INSERT INTO payments (tx_ref, gateway, amount, currency, status, metadata) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tx_ref) DO NOTHING', [tx_ref, 'flutterwave', amount, currency, 'pending', r]);

    res.json({ success: true, tx_ref, payment_link: link, raw: r });
  } catch (err) {
    console.error('init error', err);
    res.status(500).json({ success: false, message: 'internal error' });
  }
});

// Webhook endpoint to receive Flutterwave events
router.post('/flutterwave/webhook', async (req, res) => {
  try {
    const event = req.body;
    const signature = (req.headers['verif-hash'] || req.headers['verif-signature'] || req.headers['x-flw-signature']) as string | undefined;
    console.log('Received Flutterwave webhook (event type):', event && event.event ? event.event : 'no event type');

    const h = await handleWebhook(event, signature);
    if (h.ok) return res.status(200).send('OK');
    return res.status(400).send('IGNORED');
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).send('ERROR');
  }
});

export default router;
