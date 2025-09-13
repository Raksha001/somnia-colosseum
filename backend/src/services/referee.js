import cron from 'node-cron';
import { contractService } from './contract.js';

class RefereeService {
  constructor() {
    this.isRunning = false;
    this.resolutionJob = null;
  }

  start() {
    if (this.isRunning) {
      console.log('Referee service already running');
      return;
    }

    // Run every 5 minutes
    this.resolutionJob = cron.schedule('*/3 * * * *', async () => {
      await this.checkAndResolveExpiredDuels();
    }, {
      scheduled: false
    });

    this.resolutionJob.start();
    this.isRunning = true;
    
    console.log('🔥 Referee service started - checking for expired duels every 5 minutes');
  }

  stop() {
    if (this.resolutionJob) {
      this.resolutionJob.stop();
      this.resolutionJob = null;
    }
    this.isRunning = false;
    console.log('Referee service stopped');
  }

  async checkAndResolveExpiredDuels() {
    try {
      console.log('🔍 Checking for expired duels...');
      
      const resolvedDuels = await contractService.resolveExpiredDuels();
      
      if (resolvedDuels.length > 0) {
        console.log(`✅ Resolved ${resolvedDuels.length} expired duels:`, 
          resolvedDuels.map(d => `#${d.id} -> ${d.winner}`));
      } else {
        console.log('No expired duels found');
      }
    } catch (error) {
      console.error('❌ Error in referee service:', error);
    }
  }

  async forceResolutionCheck() {
    console.log('🚀 Manual resolution check initiated');
    await this.checkAndResolveExpiredDuels();
  }
}

export const refereeService = new RefereeService();