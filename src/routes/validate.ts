import { Router } from 'express';
import { luhnCheck, maskCard, getBinInfo } from '../services/validator';
import { query } from '../db';

const router = Router();

// Real-time card validation endpoint
// Expects { card_number: string, amount?: number, currency?: string }
router.post('/card', async (req, res) => {
  try {
    const { card_number, amount = 0, currency = 'USD' } = req.body;
    if (!card_number || typeof card_number !== 'string') {
      return res.status(400).json({ success: false, message: 'card_number required' });
    }

    // Do not store raw card number. Mask and store last4
    const masked = maskCard(card_number);
    const last4 = masked.slice(-4);

    const valid = luhnCheck(card_number);
    const binInfo = getBinInfo(card_number);

    // Simulate additional checks and risk scoring
    const riskScore = valid ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 70) + 30; // 1-100 lower is better
    const result = {
      valid,
      masked,
      last4,
      bin: binInfo,
      riskScore,
      message: valid ? 'Passed Luhn check' : 'Failed Luhn check',
      gatewaySuggestion: valid ? 'flutterwave' : 'manual_review'
    };

    // Record analytics event
    await query('INSERT INTO analytics_events (event_type, payload) VALUES ($1, $2)', ['card_validation', { last4, bin: binInfo, valid, riskScore, amount, currency }]);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('validation error', err);
    res.status(500).json({ success: false, message: 'internal error' });
  }
});

export default router;
