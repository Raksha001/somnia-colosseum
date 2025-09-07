import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Swords, Loader2 } from 'lucide-react';
import { useCreateDuel } from '../../hooks/useCreateDuel'; // Assuming this hook exists

interface CreateDuelButtonProps {
    tokenAddress?: string;
    amount: string;
    duration: number;
    disabled?: boolean;
}

export const CreateDuelButton: React.FC<CreateDuelButtonProps> = ({ tokenAddress, amount, duration, disabled }) => {
    const { address } = useAccount();
    const createDuel = useCreateDuel(); // Your mutation hook

    const handleCreate = async () => {
        if (!tokenAddress || !amount || !address || createDuel.isPending) return;
        try {
            await createDuel.mutateAsync({ tokenAddress, amount, duration });
        } catch (error) {
            console.error('Failed to create duel:', error);
        }
    };

    const isPending = createDuel.isPending;

    return (
        <button onClick={handleCreate} disabled={disabled || isPending} className={`w-full py-5 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-3 text-lg text-white disabled:cursor-not-allowed ${
            disabled || isPending
                ? 'bg-gray-700/50 text-gray-500'
                : 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] shadow-[0_0_25px_var(--accent-purple)] hover:shadow-[0_0_40px_var(--accent-magenta)] hover:scale-105'
        }`}>
            {isPending ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Deploying Duel...</span>
                </>
            ) : (
                <>
                    <Swords className="w-6 h-6" />
                    <span>Create Duel</span>
                </>
            )}
        </button>
    );
};