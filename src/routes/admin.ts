import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Admin stats
router.get('/stats', async (req, res) => {
  try {
    const [{ rows: paymentsCount }] = await Promise.all([query('SELECT COUNT(*)::int as count FROM payments')]);
    const paymentsRes = await query('SELECT COUNT(*)::int as count FROM payments');
    const gatewaysRes = await query('SELECT COUNT(*)::int as count FROM gateways');
    const eventsRes = await query('SELECT COUNT(*)::int as count FROM analytics_events');

    res.json({ success: true, stats: { payments: paymentsRes.rows[0].count, gateways: gatewaysRes.rows[0].count, events: eventsRes.rows[0].count } });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).json({ success: false });
  }
});

// Simple gateway management
router.post('/gateways', async (req, res) => {
  try {
    const { name, slug, config = {}, enabled = true } = req.body;
    const r = await query('INSERT INTO gateways (name, slug, config, enabled) VALUES ($1,$2,$3,$4) RETURNING *', [name, slug, config, enabled]);
    res.json({ success: true, gateway: r.rows[0] });
  } catch (err) {
    console.error('create gateway error', err);
    res.status(500).json({ success: false, message: 'error creating gateway' });
  }
});

router.get('/gateways', async (req, res) => {
  try {
    const r = await query('SELECT id,name,slug,config,enabled,created_at FROM gateways ORDER BY id');
    res.json({ success: true, gateways: r.rows });
  } catch (err) {
    console.error('list gateways error', err);
    res.status(500).json({ success: false });
  }
});

export default router;
