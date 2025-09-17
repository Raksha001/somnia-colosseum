import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Clock, DollarSign, Target, Swords } from 'lucide-react';
import { TokenSelector } from '../components/duel/TokenSelector';
import { AmountInput } from '../components/duel/AmountInput';
import { DurationSelector } from '../components/duel/DurationSelector';
import { CreateDuelButton } from '../components/duel/CreateDuelButton';

export const CreateDuelPage: React.FC = () => {
    const { isConnected } = useAccount();
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState(86400); // Default to 24 hours

    if (!isConnected) {
        return (
            <div className="text-center py-24 min-h-[60vh] flex flex-col items-center justify-center">
                <Target className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-lg text-[var(--text-primary)] opacity-70">You must be connected to enter the War Room and create a duel.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <div className="text-center space-y-4 mb-10">
                <div className="inline-block p-4 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] rounded-full mb-4 shadow-[0_0_20px_var(--accent-purple)]">
                    <Swords className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-extrabold text-white" style={{ textShadow: '0 0 15px var(--accent-purple)' }}>
                    Configure Duel
                </h1>
                <p className="text-xl text-[var(--text-primary)] opacity-70">
                    Set the terms of engagement. Your rival must match your stake.
                </p>
            </div>

            {/* Grid container for the two-column layout */}
            <div className="grid lg:grid-cols-2 lg:gap-10">
                
                {/* Left Column: Form Fields */}
                <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-8 space-y-6">
                    {/* Step 1: Token Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[var(--primary-cyan)] border-2 border-[var(--primary-cyan)] rounded-full">1</div>
                            <h3 className="text-xl font-semibold text-white">Choose Asset</h3>
                        </div>
                        <TokenSelector selectedToken={selectedToken} onTokenSelect={setSelectedToken} />
                    </div>

                    {/* Step 2: Amount Input */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[var(--accent-magenta)] border-2 border-[var(--accent-magenta)] rounded-full">2</div>
                            <h3 className="text-xl font-semibold text-white">Set The Stakes</h3>
                        </div>
                        <AmountInput amount={amount} onAmountChange={setAmount} token={selectedToken} />
                    </div>

                    {/* Step 3: Duration Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-[var(--primary-cyan)] border-2 border-[var(--primary-cyan)] rounded-full">3</div>
                            <h3 className="text-xl font-semibold text-white">Select Duration</h3>
                        </div>
                        <DurationSelector duration={duration} onDurationChange={setDuration} />
                    </div>
                </div>

                {/* Right Column: Summary & Create Button */}
                <div className="space-y-6 lg:mt-0 mt-6">
                    <div className="bg-[var(--bg-dark-purple)]/60 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-8 space-y-3 h-fit">
                        <h4 className="text-xl font-bold text-white border-b border-[var(--border-color)] pb-3 mb-4">Duel Summary</h4>
                        <div className="space-y-3 text-md">
                            <div className="flex justify-between">
                                <span className="opacity-70">Token:</span> 
                                <span className="font-semibold">{selectedToken ? selectedToken.symbol : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Your Stake:</span> 
                                <span className="font-semibold">{amount || '0'} {selectedToken?.symbol || ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Total Prize Pool:</span> 
                                <span className="font-bold text-[var(--semantic-green)] text-lg">{amount ? (parseFloat(amount) * 2).toString() : '0'} {selectedToken?.symbol || ''}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Duration:</span> 
                                <span className="font-semibold">{Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m</span>
                            </div>
                        </div>
                    </div>
                    <CreateDuelButton 
                        tokenAddress={selectedToken?.address} 
                        amount={amount} 
                        duration={duration} 
                        disabled={!selectedToken || !amount || parseFloat(amount) <= 0} 
                    />
                </div>
            </div>
        </div>
    );
};