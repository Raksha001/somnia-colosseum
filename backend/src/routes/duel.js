import express from 'express';
import Joi from 'joi';
import { contractService } from '../services/contract.js';
import { portfolioService } from '../services/portfolio.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation schemas
const createDuelSchema = Joi.object({
  tokenAddress: Joi.string().required(),
  wagerAmount: Joi.string().required(),
  duration: Joi.number().integer().min(3600).max(604800).required() // 1 hour to 7 days
});

const joinDuelSchema = Joi.object({
  duelId: Joi.number().integer().positive().required()
});

// Get all duels
router.get('/', async (req, res, next) => {
  try {
    const duels = await contractService.getAllDuels();
    res.json({ success: true, data: duels });
  } catch (error) {
    next(error);
  }
});

// Get specific duel
router.get('/:id', async (req, res, next) => {
  try {
    const duelId = parseInt(req.params.id);
    
    if (isNaN(duelId) || duelId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid duel ID' 
      });
    }

    const duel = await contractService.getDuel(duelId);
    
    if (!duel) {
      return res.status(404).json({ 
        success: false, 
        error: 'Duel not found' 
      });
    }

    // Get live portfolio data if duel is active
    let liveStats = null;
    if (duel.status === 'ACTIVE' && !duel.resolved) {
      try {
        liveStats = await portfolioService.getDuelLiveStats(duelId);
      } catch (error) {
        console.warn(`Failed to get live stats for duel ${duelId}:`, error.message);
      }
    }

    res.json({ 
      success: true, 
      data: { 
        ...duel, 
        liveStats 
      } 
    });
  } catch (error) {
    next(error);
  }
});

// Create new duel
// NEW: Removed create duel endpoint - now handled by frontend transactions

// Join existing duel
// NEW: Removed join duel endpoint - now handled by frontend transactions

// Cancel duel (only creator)
router.delete('/:id', async (req, res, next) => {
  try {
    const duelId = parseInt(req.params.id);
    
    if (isNaN(duelId) || duelId <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid duel ID' 
      });
    }

    await contractService.cancelDuel(duelId);

    res.json({ 
      success: true, 
      data: { 
        message: 'Duel cancelled successfully' 
      } 
    });
  } catch (error) {
    next(error);
  }
});

// Resolve duel (internal endpoint)
router.post('/resolve', async (req, res, next) => {
  try {
    // Verify internal API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const resolvedDuels = await contractService.resolveExpiredDuels();

    res.json({ 
      success: true, 
      data: { 
        resolvedCount: resolvedDuels.length,
        resolvedDuels 
      } 
    });
  } catch (error) {
    next(error);
  }
});

export { router as duelRoutes };