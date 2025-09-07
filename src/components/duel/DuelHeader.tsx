import React from 'react';
import { Crown, Trophy, User } from 'lucide-react';

interface DuelHeaderProps {
  duel: any; // It's best to replace 'any' with your actual duel type/interface
}

// A helper function to truncate addresses for display
const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const DuelHeader: React.FC<DuelHeaderProps> = ({ duel }) => {
    // THEME: Using the same themed status colors as the DuelCard for consistency
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'OPEN': return { text: 'text-[var(--accent-magenta)]', bg: 'bg-[var(--accent-magenta)]/10', border: 'border-[var(--accent-magenta)]/30' };
            case 'ACTIVE': return { text: 'text-[var(--primary-cyan)]', bg: 'bg-[var(--primary-cyan)]/10', border: 'border-[var(--primary-cyan)]/30' };
            case 'RESOLVED': return { text: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10', border: 'border-[var(--accent-purple)]/30' };
            default: return { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
        }
    };
    const statusInfo = getStatusInfo(duel.status);

    const isOpponentJoined = duel.opponent && !duel.opponent.startsWith('0x000');
    const isWinnerCreator = duel.status === 'RESOLVED' && duel.winner?.toLowerCase() === duel.creator?.toLowerCase();
    const isWinnerOpponent = duel.status === 'RESOLVED' && duel.winner?.toLowerCase() === duel.opponent?.toLowerCase();

    return (
        // THEME: Main container with frosted glass effect
        <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* --- Left Player Panel (Creator) --- */}
                <div className="w-full md:w-1/3 text-center md:text-left relative">
                    {isWinnerCreator && (
                        <div className="absolute -top-4 -left-4 flex items-center space-x-2 text-lg font-bold text-[var(--semantic-green)]">
                            <Crown size={24}/> <span>WINNER</span>
                        </div>
                    )}
                    <div className="text-sm text-[var(--text-primary)] opacity-70">Creator</div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                        <User className="w-5 h-5 text-[var(--primary-cyan)]" />
                        <span className="text-lg font-semibold text-white">{truncateAddress(duel.creator)}</span>
                    </div>
                </div>

                {/* --- Central Prize Pool & Status --- */}
                <div className="w-full md:w-1/3 text-center border-y-2 md:border-y-0 md:border-x-2 border-[var(--border-color)] py-6 md:py-0 md:px-6">
                    <div className="text-sm text-[var(--text-primary)] opacity-70 mb-1">PRIZE POOL</div>
                    <div className="text-4xl lg:text-5xl font-extrabold text-[var(--semantic-green)] flex items-center justify-center space-x-2">
                        <Trophy className="w-8 h-8 opacity-80" />
                        <span>{(parseFloat(duel.wagerAmount) * 2).toFixed(2)}</span>
                    </div>
                    <div className="text-lg text-[var(--text-primary)] opacity-70 mt-1">{duel.tokenSymbol || 'TOKEN'}</div>
                    <div className={`mt-4 inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusInfo.text} ${statusInfo.bg} border ${statusInfo.border}`}>
                        {duel.status}
                    </div>
                </div>

                {/* --- Right Player Panel (Opponent) --- */}
                <div className="w-full md:w-1/3 text-center md:text-right relative">
                    {isWinnerOpponent && (
                         <div className="absolute -top-4 -right-4 flex items-center space-x-2 text-lg font-bold text-[var(--semantic-green)]">
                            <Crown size={24}/> <span>WINNER</span>
                        </div>
                    )}
                    <div className="text-sm text-[var(--text-primary)] opacity-70">Opponent</div>
                    {isOpponentJoined ? (
                        <div className="flex items-center justify-center md:justify-end space-x-2 mt-1">
                            <User className="w-5 h-5 text-[var(--accent-magenta)]" />
                            <span className="text-lg font-semibold text-white">{truncateAddress(duel.opponent)}</span>
                        </div>
                    ) : (
                        <div className="text-lg font-semibold text-[var(--text-primary)] opacity-50 mt-1">
                            Waiting to Join...
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};