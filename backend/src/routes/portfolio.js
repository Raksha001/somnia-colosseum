import express from 'express';
import { portfolioService } from '../services/portfolio.js';

const router = express.Router();

// Get portfolio value for address
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { timestamp } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const portfolio = await portfolioService.getPortfolioValue(
      address, 
      timestamp ? parseInt(timestamp) : undefined
    );

    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
});

// Get token prices
router.get('/prices/:tokenAddress', async (req, res, next) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'Token address is required'
      });
    }

    const price = await portfolioService.getTokenPrice(tokenAddress);

    res.json({ success: true, data: { price } });
  } catch (error) {
    next(error);
  }
});

export { router as portfolioRoutes };