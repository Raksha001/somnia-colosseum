import express from 'express';
import { somniaTokenService } from '../services/somniaTokenService.js';

const router = express.Router();

// Get supported tokens
router.get('/tokens', async (req, res, next) => {
  try {
    const tokens = await somniaTokenService.getSupportedTokens();
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
});

export { router as swapRoutes };