import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/admin/payments - List all payments
router.get('/payments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM payments ORDER BY timestamp DESC').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

// GET /api/admin/payments/search - Search payments by wallet or memo
router.get('/payments/search', (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const search = `%${query.toLowerCase()}%`;
    const rows = db.prepare(
      `SELECT * FROM payments 
       WHERE LOWER(sender) LIKE ? OR LOWER(memo) LIKE ? 
       ORDER BY timestamp DESC`
    ).all(search, search);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to search payments' });
  }
});

// POST /api/admin/override - Manual override (placeholder)
router.post('/override', (req, res) => {
  // In a real system, this would require strong authentication and logging
  // For now, it's a placeholder to satisfy the requirement
  console.log('Admin override requested:', req.body);
  res.json({ status: 'success', message: 'Manual override placeholder executed' });
});

export default router;
