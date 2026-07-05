import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

export default router;
