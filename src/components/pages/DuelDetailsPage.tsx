import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDuel } from '../hooks/useDuel'; // Assuming this hook exists
import { DuelHeader } from '../components/duel/DuelHeader';
import { DuelStats } from '../components/duel/DuelStats';
import { JoinDuelButton } from '../components/duel/JoinDuelButton';
import { TradingInterface } from '../components/trading/TradingInterface';
import { DuelTimeline } from '../components/duel/DuelTimeline';
import { SwapModal } from '../components/trading/SwapModal';
import { ShieldAlert } from 'lucide-react';

export const DuelDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const duelId = parseInt(id || '0');
    const { data: duel, isLoading, error } = useDuel(duelId);
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

    // THEME: A themed skeleton that mimics the final page layout for a better loading experience
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-[var(--bg-dark-purple)]/60 border border-[var(--border-color)] rounded-2xl h-48 p-8">
                    <div className="h-10 bg-[var(--border-color)] rounded w-1/2"></div>
                    <div className="h-6 bg-[var(--border-color)] rounded w-1/4 mt-4"></div>
                </div>
                {/* Main Content Skeleton */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[var(--bg-dark-purple)]/60 border border-[var(--border-color)] rounded-2xl h-96"></div>
                    <div className="bg-[var(--bg-dark-purple)]/60 border border-[var(--border-color)] rounded-2xl h-72"></div>
                </div>
            </div>
        );
    }

    // THEME: A themed error state for when a duel is not found
    if (error || !duel) {
        return (
            <div className="text-center py-24 min-h-[60vh] flex flex-col items-center justify-center">
                <ShieldAlert className="w-16 h-16 text-[var(--semantic-red)] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Duel Not Found</h2>
                <p className="text-lg text-[var(--text-primary)] opacity-70">The battle you're looking for doesn't exist or has concluded.</p>
            </div>
        );
    }

    return (
        // THEME: Main page container with consistent padding and width
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
            <DuelHeader duel={duel} />
      
            {/* The Join Duel button is only shown for OPEN duels */}
            {duel.status === 'OPEN' && (
                <div className="max-w-md mx-auto">
                    <JoinDuelButton 
            duelId={duel.id} 
            onOpenSwapModal={() => setIsSwapModalOpen(true)} 
        />
                </div>
            )}
      
            {/* Main two-column layout for the battleground */}
            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Left/Main Column: Stats and Trading */}
                <div className="lg:col-span-2 space-y-8">
                    <DuelStats duel={duel} />
          
                    {/* The Trading Interface is only shown for ACTIVE duels */}
                    {duel.status === 'ACTIVE' && (
                        <TradingInterface onOpenSwapModal={() => setIsSwapModalOpen(true)} />
                    )}
                </div>
                
                {/* Right Column: Timeline */}
                <div className="space-y-8">
                    <DuelTimeline duel={duel} />
                </div>
            </div>

            {/* The Swap Modal is controlled by this page's state */}
            <SwapModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
            />
        </div>
    );
};