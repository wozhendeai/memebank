import express from 'express';
import { getLatestBalance, getBalanceHistory } from '../services/balanceService.ts';

const router = express.Router();

router.get('/:address/latest', async (req, res) => {
  const balance = await getLatestBalance(req.params.address);
  if (balance) {
    res.json(balance);
  } else {
    res.status(404).json({ error: 'Balance not found' });
  }
});

router.get('/:address/history', async (req, res) => {
  const history = await getBalanceHistory(req.params.address);
  res.json(history);
});

export default router;
