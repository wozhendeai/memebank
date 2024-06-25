import express from 'express';
import { getAccounts, getAccount, updateUsername } from '../services/accountService.ts';

const router = express.Router();

router.get('/', async (req, res) => {
  const accounts = await getAccounts();
  res.json(accounts);
});

router.get('/:address', async (req, res) => {
  const account = await getAccount(req.params.address);
  if (account) {
    res.json(account);
  } else {
    res.status(404).json({ error: 'Account not found' });
  }
});

router.put('/:address/username', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const updatedAccount = await updateUsername(req.params.address, username);
    res.json(updatedAccount);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

export default router;