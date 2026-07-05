import { Router } from 'express';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Create a bulk job. Expects { items: [ { card_number, amount, currency } ] }
router.post('/jobs', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'items required' });

    const jobRef = `job_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const r = await query('INSERT INTO bulk_jobs (job_ref, total, processed, status, result) VALUES ($1,$2,$3,$4,$5) RETURNING *', [jobRef, items.length, 0, 'pending', {}]);

    // In production we'd push this to a queue (Redis, RabbitMQ). For now we simulate async processing.
    setTimeout(async () => {
      // simulate processing
      const processed = items.map((it: any) => ({ last4: it.card_number.slice(-4), masked: '****' + it.card_number.slice(-4), success: true }));
      await query('UPDATE bulk_jobs SET processed = $1, status = $2, result = $3, updated_at = now() WHERE job_ref = $4', [items.length, 'completed', { processed }, jobRef]);
    }, 2000);

    res.json({ success: true, jobRef, job: r.rows[0] });
  } catch (err) {
    console.error('bulk create error', err);
    res.status(500).json({ success: false });
  }
});

router.get('/jobs/:ref', async (req, res) => {
  try {
    const { ref } = req.params;
    const r = await query('SELECT * FROM bulk_jobs WHERE job_ref = $1', [ref]);
    if (r.rowCount === 0) return res.status(404).json({ success: false });
    res.json({ success: true, job: r.rows[0] });
  } catch (err) {
    console.error('bulk get error', err);
    res.status(500).json({ success: false });
  }
});

export default router;
