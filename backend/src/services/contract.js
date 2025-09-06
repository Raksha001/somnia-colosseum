import { ethers } from 'ethers';
import { portfolioService } from './portfolio.js';

class ContractService {
  constructor() {
    // this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.provider = new ethers.JsonRpcProvider(
      "https://dream-rpc.somnia.network", // Somnia testnet RPC (no trailing slash)
      {
        name: "Somnia Testnet",
        chainId: 50312
      }
    );
    // NEW: Only create wallet for referee functions, not user transactions
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", this.provider);
    
    // Contract ABI (simplified)
    this.contractABI = [
      // NEW: Removed user transaction functions, keep only read and referee functions
      "function resolveDuel(uint256 duelId, address winner) external",
      "function cancelDuel(uint256 duelId) external",
      "function getDuel(uint256 duelId) external view returns (tuple(uint256 id, address creator, address opponent, address tokenAddress, uint256 wagerAmount, uint256 duration, uint256 startTime, uint256 endTime, bool resolved, address winner, uint8 status))",
      "function isDuelExpired(uint256 duelId) external view returns (bool)",
      "function nextDuelId() external view returns (uint256)",
      "event DuelCreated(uint256 indexed duelId, address indexed creator, address tokenAddress, uint256 wagerAmount, uint256 duration)",
      "event DuelJoined(uint256 indexed duelId, address indexed opponent, uint256 startTime, uint256 endTime)",
      "event DuelResolved(uint256 indexed duelId, address indexed winner, uint256 totalPayout)"
    ];
    
    // NEW: Read-only contract for monitoring
    this.readContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS || "",
      this.contractABI,
      this.provider
    );
    
    // NEW: Write contract only for referee functions
    this.writeContract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS || "",
      this.contractABI,
      this.wallet
    );
    
    this.duelCache = new Map();
    this.lastCacheUpdate = 0;
    this.CACHE_DURATION = 30000; // 30 seconds
  }

  // NEW: Removed createDuel and joinDuel - now handled by frontend

  async cancelDuel(duelId) {
    try {
      const tx = await this.writeContract.cancelDuel(duelId);
      await tx.wait();
      this.invalidateCache();
    } catch (error) {
      console.error('Cancel duel error:', error);
      throw new Error(`Failed to cancel duel: ${error.message}`);
    }
  }

  async getDuel(duelId) {
    try {
      const duelData = await this.readContract.getDuel(duelId);
      return this.formatDuelData(duelData);
    } catch (error) {
      console.error('Get duel error:', error);
      return null;
    }
  }

  async getAllDuels() {
    const now = Date.now();
    if (this.duelCache.size > 0 && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
      return Array.from(this.duelCache.values());
    }

    try {
      const nextDuelId = await this.readContract.nextDuelId();
      const duels = [];

      for (let i = 1; i < nextDuelId; i++) {
        try {
          const duel = await this.getDuel(i);
          if (duel) {
            duels.push(duel);
            this.duelCache.set(i, duel);
          }
        } catch (error) {
          console.warn(`Failed to fetch duel ${i}:`, error.message);
        }
      }

      this.lastCacheUpdate = now;
      return duels;
    } catch (error) {
      console.error('Get all duels error:', error);
      throw new Error(`Failed to fetch duels: ${error.message}`);
    }
  }

  async resolveExpiredDuels() {
    try {
      const duels = await this.getAllDuels();
      const expiredDuels = duels.filter(duel => 
        duel.status === 'ACTIVE' && 
        !duel.resolved && 
        Date.now() / 1000 >= duel.endTime
      );

      const resolvedDuels = [];

      for (const duel of expiredDuels) {
        try {
          const winner = await this.calculateWinner(duel);
          await this.resolveDuel(duel.id, winner);
          resolvedDuels.push({ ...duel, winner });
        } catch (error) {
          console.error(`Failed to resolve duel ${duel.id}:`, error.message);
        }
      }

      return resolvedDuels;
    } catch (error) {
      console.error('Resolve expired duels error:', error);
      throw error;
    }
  }

  async resolveDuel(duelId, winner) {
    try {
      // NEW: Only referee functions use writeContract with private key
      const tx = await this.writeContract.resolveDuel(duelId, winner);
      await tx.wait();
      this.invalidateCache();
    } catch (error) {
      console.error('Resolve duel error:', error);
      throw new Error(`Failed to resolve duel: ${error.message}`);
    }
  }

  async calculateWinner(duel) {
    try {
      // Get portfolio values at start and end
      const [creatorStart, opponentStart] = await Promise.all([
        portfolioService.getPortfolioValue(duel.creator, duel.startTime),
        portfolioService.getPortfolioValue(duel.opponent, duel.startTime)
      ]);

      const [creatorEnd, opponentEnd] = await Promise.all([
        portfolioService.getPortfolioValue(duel.creator),
        portfolioService.getPortfolioValue(duel.opponent)
      ]);

      // Calculate P&L percentages
      const creatorPnL = ((creatorEnd.totalValue - creatorStart.totalValue) / creatorStart.totalValue) * 100;
      const opponentPnL = ((opponentEnd.totalValue - opponentStart.totalValue) / opponentStart.totalValue) * 100;

      console.log(`Duel ${duel.id} P&L - Creator: ${creatorPnL.toFixed(2)}%, Opponent: ${opponentPnL.toFixed(2)}%`);

      return creatorPnL > opponentPnL ? duel.creator : duel.opponent;
    } catch (error) {
      console.error('Calculate winner error:', error);
      throw error;
    }
  }

  formatDuelData(duelData) {
    const statusMap = ['OPEN', 'ACTIVE', 'RESOLVED', 'CANCELLED'];
    
    return {
      id: Number(duelData.id),
      creator: duelData.creator,
      opponent: duelData.opponent,
      tokenAddress: duelData.tokenAddress,
      wagerAmount: ethers.formatUnits(duelData.wagerAmount, 18),
      duration: Number(duelData.duration),
      startTime: Number(duelData.startTime),
      endTime: Number(duelData.endTime),
      resolved: duelData.resolved,
      winner: duelData.winner,
      status: statusMap[duelData.status] || 'UNKNOWN'
    };
  }

  invalidateCache() {
    this.duelCache.clear();
    this.lastCacheUpdate = 0;
  }
}

export const contractService = new ContractService();