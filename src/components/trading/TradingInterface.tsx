import React from 'react';
import { ArrowLeftRight, BarChart, Percent, MinusCircle, TrendingUp } from 'lucide-react';

interface TradingInterfaceProps {
  // We remove the 'duel' prop as it's not used here, simplifying the component.
  onOpenSwapModal: () => void;
}

export const TradingInterface: React.FC<TradingInterfaceProps> = ({ onOpenSwapModal }) => {
  // CLEANUP: Removed local state and rendering for SwapModal, as it's handled by the parent page.

  // Placeholder data for the trading stats. This would come from your hooks.
  const tradingStats = {
    tradesMade: 8,
    volume: 12340,
    currentPnl: 12.3,
    avgGas: 0.45,
  };

  return (
    // THEME: Main container with frosted glass effect
    <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Action Panel</h2>
        <div className="flex items-center space-x-2 text-[var(--semantic-green)]">
          <div className="w-2 h-2 bg-[var(--semantic-green)] rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Trading is Live</span>
        </div>
      </div>

      <p className="text-[var(--text-primary)] opacity-70 mb-6">
        Execute swaps to outperform your rival. Every trade counts.
      </p>

      {/* FOCUS: A single, clear call-to-action for the most important function */}
      <button
        onClick={onOpenSwapModal}
        className="w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 text-lg
                   bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] text-white 
                   shadow-[0_0_25px_var(--accent-purple)] hover:shadow-[0_0_40px_var(--accent-magenta)] hover:scale-105"
      >
        <ArrowLeftRight />
        <span>Open Swap Terminal</span>
      </button>

      {/* THEME: Themed trading stats section */}
      {/* <div className="bg-black/30 rounded-lg p-4 mt-6 border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold text-white mb-4">Your Session Stats</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
              <MinusCircle size={20} className="opacity-70"/> 
              <span>{tradingStats.tradesMade}</span>
            </div>
            <div className="text-[var(--text-primary)] opacity-70 text-sm">Trades Made</div>
            
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
              <BarChart size={20} className="opacity-70"/> 
              <span>${tradingStats.volume.toLocaleString()}</span>
            </div>
            <div className="text-[var(--text-primary)] opacity-70 text-sm">Volume</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold flex items-center justify-center space-x-2 ${
              tradingStats.currentPnl >= 0 ? 'text-[var(--semantic-green)]' : 'text-[var(--semantic-red)]'
            }`}>
              <TrendingUp size={20} /> 
              <span>{tradingStats.currentPnl.toFixed(1)}%</span>
            </div>
            <div className="text-[var(--text-primary)] opacity-70 text-sm">Current P&L</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
              <Percent size={20} className="opacity-70"/> 
              <span>${tradingStats.avgGas.toFixed(2)}</span>
            </div>
            <div className="text-[var(--text-primary)] opacity-70 text-sm">Avg Gas</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};