import { Router } from 'express';
import { config } from '../config';

const router = Router();

// Initialize a Flutterwave payment (sandbox)
router.post('/flutterwave/init', async (req, res) => {
  try {
    const { amount, currency = 'USD', customer } = req.body;
    // For now return a simulated payment link and reference
    const tx_ref = `ccg_${Date.now()}`;
    const payment_link = `https://flutterwave.com/pay/${tx_ref}`;

    // TODO: implement real Flutterwave API call using FLW keys

    res.json({ success: true, tx_ref, payment_link, sandbox: config.flwSandbox });
  } catch (err) {
    console.error('init error', err);
    res.status(500).json({ success: false, message: 'internal error' });
  }
});

// Webhook endpoint to receive Flutterwave events
router.post('/flutterwave/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('Received Flutterwave webhook:', JSON.stringify(event));

    // TODO: validate signature, verify transaction with Flutterwave, update DB

    res.status(200).send('OK');
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).send('ERROR');
  }
});

export default router;
