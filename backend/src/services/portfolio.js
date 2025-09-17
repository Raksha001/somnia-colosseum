import { somniaTokenService } from './somniaTokenService.js';
import { somniaService } from './somniaService.js';

class PortfolioService {
  constructor() {
    this.priceCache = new Map();
    this.portfolioCache = new Map();
    this.CACHE_DURATION = 60000; // 1 minute
  }
async getPortfolioValue(address) {
    const cacheKey = address;
    const cached = this.portfolioCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`[Cache HIT] Returning cached portfolio for ${address}`);
      return cached.data;
    }

    console.log(`[Cache MISS] Fetching new portfolio for ${address}`);
    try {
      // Call our new Somnia service to get the correctly calculated portfolio data
      const portfolioData = await somniaService.getPortfolio(address);

      // Structure the result to match the format your frontend expects
      const result = {
        address,
        totalValue: portfolioData.totalValue,
        tokens: portfolioData.tokens, // The 'tokens' array now includes the `value_usd` field
        timestamp: Math.floor(Date.now() / 1000)
      };

      this.portfolioCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Portfolio service error:', error);
      throw error;
    }
  }

   async getDuelLiveStats(duelId) {
    try {
      // FIX: Use a dynamic import to safely import contractService and avoid circular dependencies.
      const { contractService } = await import('./contract.js');
      const duel = await contractService.getDuel(duelId);

      if (!duel || duel.status !== 'ACTIVE') {
        // Return null if the duel isn't active or doesn't exist.
        return null;
      }
      
      // Fetch the current portfolio values for both players in parallel.
      const [creatorPortfolio, opponentPortfolio] = await Promise.all([
        this.getPortfolioValue(duel.creator),
        duel.opponent && !duel.opponent.startsWith('0x000') 
          ? this.getPortfolioValue(duel.opponent) 
          : Promise.resolve({ totalValue: 0 }) // Opponent might not have joined yet
      ]);
      
      const creatorCurrentValue = creatorPortfolio.totalValue;
      const opponentCurrentValue = opponentPortfolio.totalValue;
      
      // For P&L, the 'initial value' is the wager amount they staked to start the duel.
      const initialValue = parseFloat(duel.wagerAmount);

      // Helper to calculate P&L percentage safely.
      const calculatePnL = (current, initial) => {
        if (initial === 0) return 0; // Avoid division by zero
        return ((current - initial) / initial) * 100;
      };

      const creatorPnL = calculatePnL(creatorCurrentValue, initialValue);
      const opponentPnL = calculatePnL(opponentCurrentValue, initialValue);

      // Return the data in the structure your frontend expects.
      return {
        creator: {
          currentValue: creatorCurrentValue,
          pnlPercent: creatorPnL,
        },
        opponent: {
          currentValue: opponentCurrentValue,
          pnlPercent: opponentPnL,
        },
        lastUpdate: Date.now()
      };

    } catch (error) {
      console.error(`Error getting live stats for duel ${duelId}:`, error);
      throw error;
    }
  }

  clearCache() {
    this.priceCache.clear();
    this.portfolioCache.clear();
  }
}

export const portfolioService = new PortfolioService();