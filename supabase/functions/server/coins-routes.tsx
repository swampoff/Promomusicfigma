import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { resolveUserId } from './resolve-user-id.tsx';

const coinsRoutes = new Hono();
const DEMO_USER = 'demo-user';

// GET /coins/balance
coinsRoutes.get('/balance', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const balance = await kv.get(`coins:balance:${userId}`);
    return c.json({ success: true, data: balance || { balance: 0, userId } });
  } catch (error) {
    return c.json({ success: true, data: { balance: 0 } });
  }
});

// GET /coins/transactions
coinsRoutes.get('/transactions', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const txns = await kv.getByPrefix(`coins:tx:${userId}:`);
    return c.json({ success: true, data: txns || [] });
  } catch (error) {
    return c.json({ success: true, data: [] });
  }
});

// POST /coins/transactions
coinsRoutes.post('/transactions', async (c) => {
  try {
    const userId = await resolveUserId(c, DEMO_USER);
    const body = await c.req.json();
    const txId = `cointx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const transaction = {
      id: txId,
      userId,
      amount: body.amount || 0,
      type: body.type || 'reward',
      description: body.description || '',
      createdAt: now,
    };

    // Update balance
    const current = await kv.get(`coins:balance:${userId}`);
    const currentBalance = current?.balance || 0;
    const newBalance = currentBalance + (transaction.amount || 0);
    await kv.set(`coins:balance:${userId}`, { balance: newBalance, userId });

    // Save transaction
    await kv.set(`coins:tx:${userId}:${txId}`, transaction);

    return c.json({ success: true, data: { transaction, balance: newBalance } }, 201);
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default coinsRoutes;
