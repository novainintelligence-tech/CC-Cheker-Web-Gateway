import { Router } from 'express';
import { query } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Payments list for admin (paginated)
router.get('/payments', requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Math.min(100, Number(req.query.per_page || 25));
    const offset = (page - 1) * perPage;
    const r = await query('SELECT id, tx_ref, gateway, amount, currency, status, metadata, created_at FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2', [perPage, offset]);
    const c = await query('SELECT COUNT(*)::int as count FROM payments');
    res.json({ success: true, payments: r.rows, total: c.rows[0].count, page, perPage });
  } catch (err) {
    console.error('admin payments error', err);
    res.status(500).json({ success: false });
  }
});

// Simple analytics aggregation: events per day for last 7 days
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const r = await query(`SELECT to_char(created_at::date, 'YYYY-MM-DD') as day, COUNT(*)::int as count FROM analytics_events WHERE created_at > now() - interval '14 days' GROUP BY day ORDER BY day ASC`);
    res.json({ success: true, series: r.rows });
  } catch (err) {
    console.error('analytics error', err);
    res.status(500).json({ success: false });
  }
});

export default router;
