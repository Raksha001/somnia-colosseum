import React from 'react';
import { useBalance, useAccount } from 'wagmi';

interface AmountInputProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    token?: { address?: `0x${string}`; symbol?: string; };
}

export const AmountInput: React.FC<AmountInputProps> = ({ amount, onAmountChange, token }) => {
    const { address } = useAccount();
    const { data: balanceData } = useBalance({ address, token: token?.address, watch: true });

    return (
        <div className="space-y-4 font-display">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] rounded-lg blur opacity-0 group-focus-within:opacity-75 transition duration-200"></div>
                <input type="number" value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="0.0" className="relative w-full p-4 bg-[var(--bg-dark-purple)] border border-[var(--border-color)] rounded-lg text-white text-xl font-semibold placeholder:opacity-60 focus:outline-none pr-24" min="0" step="any" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-primary)] font-bold">{token?.symbol || 'TOKEN'}</div>
            </div>

            <div className="flex justify-between text-sm">
                <span className="opacity-70">Your Balance:</span>
                <span className="font-semibold text-white">{balanceData?.formatted || '0.00'} {balanceData?.symbol || ''}</span>
            </div>
        </div>
    );
};