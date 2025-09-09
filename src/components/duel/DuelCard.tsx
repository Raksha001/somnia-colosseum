// components/duel/DuelCard.tsx
import React from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, DollarSign, Swords } from 'lucide-react';
import { useToken } from '../../hooks/useTokens'; // Import the new hook


interface DuelCardProps {
  duel: any; // Replace 'any' with your duel type definition
}

export const DuelCard: React.FC<DuelCardProps> = ({ duel }) => {

    const { data: tokens, isLoading: isLoadingTokens } = useToken();

    // 2. Find the token symbol for this specific duel using useMemo for efficiency
  const tokenSymbol = useMemo(() => {
    if (isLoadingTokens || !tokens || !duel.tokenAddress) {
      return '...'; // Show a loading state
    }
    const token = tokens.find(t => t.address.toLowerCase() === duel.tokenAddress.toLowerCase());
    return token ? token.symbol : 'UNKNOWN'; // Fallback if not found
  }, [tokens, isLoadingTokens, duel.tokenAddress]);

  // THEME: Updated status colors to match the new palette
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'OPEN': return { text: 'text-[var(--accent-magenta)]', bg: 'bg-[var(--accent-magenta)]/10', border: 'border-[var(--accent-magenta)]/30' };
      case 'ACTIVE': return { text: 'text-[var(--primary-cyan)]', bg: 'bg-[var(--primary-cyan)]/10', border: 'border-[var(--primary-cyan)]/30' };
      case 'RESOLVED': return { text: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10', border: 'border-[var(--accent-purple)]/30' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
    }
  };

  const statusInfo = getStatusInfo(duel.status);

  // You can replace this with a more robust time formatting library if needed
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0h 0m';
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    if (d > 0) return `${d}d ${h}h`;
    return `${h}h ${m}m`;
  };

  const timeRemaining = duel.endTime ? Math.max(0, duel.endTime - Math.floor(Date.now() / 1000)) : 0;

  return (
    // THEME: Overhauled card with frosted glass, new borders, and gamified hover effects
    <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-xl p-6 
                   transition-all duration-300 group hover:border-[var(--primary-cyan)] 
                   hover:shadow-[0_0_25px_-5px_var(--primary-cyan)] hover:-translate-y-2 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3">
          <Swords className="w-5 h-5 text-[var(--primary-cyan)]" />
          <span className="text-lg font-bold text-white">Duel #{duel.id}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.text} ${statusInfo.bg} border ${statusInfo.border}`}>
          {duel.status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-primary)] opacity-70">Prize Pool:</span>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">
              {/* 3. Display the symbol, with a fallback for loading state */}
              {(parseFloat(duel.wagerAmount) * 2).toFixed(2)} {tokenSymbol}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-primary)] opacity-70">Players:</span>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-white font-semibold">
              {!duel.opponent || duel.opponent.startsWith('0x000') ? '1 / 2' : '2 / 2'}
            </span>
          </div>
        </div>
        {(duel.status === 'ACTIVE' || duel.status === 'RESOLVED') && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-primary)] opacity-70">{duel.status === 'ACTIVE' ? 'Time Left:' : 'Duration:'}</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-white font-semibold">{formatTime(duel.status === 'ACTIVE' ? timeRemaining : duel.duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        to={`/duel/${duel.id}`}
        className="w-full text-center py-3 font-bold border-2 border-[var(--primary-cyan)] text-[var(--primary-cyan)] 
                   rounded-lg hover:bg-[var(--primary-cyan)] hover:text-black transition-all duration-300
                   group-hover:shadow-[0_0_15px_var(--primary-cyan)]"
      >
        View Duel
      </Link>
    </div>
  );
};