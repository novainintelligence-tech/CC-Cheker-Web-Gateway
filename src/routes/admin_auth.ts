import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const router = Router();

// Simple admin login using ADMIN_EMAIL/ADMIN_PASSWORD env vars
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
    if (email !== adminEmail || password !== adminPassword) return res.status(401).json({ success: false, message: 'invalid credentials' });
    const token = jwt.sign({ email, role: 'admin' }, config.jwtSecret, { expiresIn: '12h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('admin login error', err);
    res.status(500).json({ success: false });
  }
});

export default router;
