import React, { useEffect, useMemo } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Swords, Loader2, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { useJoinDuel } from '../../hooks/useJoinDuel';
import { useDuel } from '../../hooks/useDuel';
import { useSwapStore } from '../../hooks/use-swap-store';
import { useToken } from '../../hooks/useTokens';
import { parseUnits, type Address } from 'viem';
import { DUEL_CONTRACT_ADDRESS, erc20Abi, NATIVE_TOKEN } from '../../lib/constants';

interface JoinDuelButtonProps {
  duelId: number;
  onOpenSwapModal: () => void;
}

export const JoinDuelButton: React.FC<JoinDuelButtonProps> = ({ duelId, onOpenSwapModal }) => {
    const { address } = useAccount();
    const { data: duel } = useDuel(duelId);
    const { data: allTokens } = useToken();
    const { setTokenIn, setTokenOut, setAmountOut } = useSwapStore();
    const joinDuelMutation = useJoinDuel();

    // --- 1. FETCHING DATA ---

    const wagerTokenAddress = duel?.tokenAddress as Address | undefined;

    // Find the full token object to get its decimals
    const wagerToken = useMemo(() => {
        if (!wagerTokenAddress || !allTokens) return null;
        return allTokens.find(t => t.address.toLowerCase() === wagerTokenAddress.toLowerCase());
    }, [wagerTokenAddress, allTokens]);

    const { data: balanceData } = useBalance({
        address,
        token: wagerTokenAddress,
        query: { enabled: !!wagerTokenAddress } // Only run when we have the address
    });

    // --- 2. DERIVING STATE ---

    const wagerAmountBI = useMemo(() => {
        return (duel && duel.wagerAmount && wagerToken)
            ? parseUnits(duel.wagerAmount, wagerToken.decimals)
            : 0n;
    }, [duel, wagerToken]);

    const userHasEnoughTokens = balanceData ? balanceData.value >= wagerAmountBI : false;

    // Approval flow state
    const { data: allowance, refetch } = useReadContract({
        address: wagerTokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address!, DUEL_CONTRACT_ADDRESS],
        query: { enabled: !!address && !!wagerTokenAddress && userHasEnoughTokens },
    });
    const { data: approveHash, writeContract: approve, isPending: isApproving } = useWriteContract();
    const { isLoading: isConfirmingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    useEffect(() => { if (isApprovalSuccess) refetch() }, [isApprovalSuccess, refetch]);
    
    const needsApproval = userHasEnoughTokens && allowance !== undefined && allowance < wagerAmountBI;
    const isPending = isApproving || isConfirmingApproval || joinDuelMutation.isPending;

    // --- 3. HANDLERS ---

    const handleApprove = () => approve({ address: wagerTokenAddress, abi: erc20Abi, functionName: 'approve', args: [DUEL_CONTRACT_ADDRESS, wagerAmountBI] });
    const handleJoinDuel = () => joinDuelMutation.mutate({ duelId });
    const handleSwapToJoin = () => {
        if (!duel || !wagerToken) return;
        // Configure the swap modal for this specific task
        setTokenIn(NATIVE_TOKEN);       // Default to swapping FROM the user's native currency
        setTokenOut(wagerToken);        // We need to swap TO the required token
        setAmountOut(duel.wagerAmount); // We need exactly this amount
        onOpenSwapModal();
    };

    // --- 4. RENDER LOGIC ---

    if (!duel || !wagerToken) {
        return <div className="w-full py-4 bg-[var(--border-color)]/30 rounded-lg animate-pulse h-[52px]"></div>;
    }
    if (!address || (duel.creator && duel.creator.toLowerCase() === address.toLowerCase())) {
        return null;
    }
    if (duel.status !== 'OPEN') {
        return null;
    }

    const baseClasses = "w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-3 text-lg";
    const actionClasses = "text-white bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] shadow-[0_0_25px_var(--accent-purple)] hover:shadow-[0_0_40px_var(--accent-magenta)] hover:scale-105";
    const disabledClasses = "bg-[var(--border-color)]/30 text-[var(--text-primary)]/50 cursor-not-allowed";
    const successClasses = "bg-[var(--semantic-green)]/20 text-[var(--semantic-green)] border border-[var(--semantic-green)]/30 cursor-default";

    if (joinDuelMutation.isSuccess) {
        return (
            <div className={`${baseClasses} ${successClasses}`}>
                <CheckCircle className="w-6 h-6" />
                <span>Joined Successfully!</span>
            </div>
        );
    }

    if (userHasEnoughTokens) {
        if (needsApproval) {
            return (
                <button onClick={handleApprove} disabled={isPending} className={`${baseClasses} ${isPending ? disabledClasses : actionClasses}`}>
                    {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                    <span>Approve {wagerToken.symbol}</span>
                </button>
            );
        }
        return (
            <button onClick={handleJoinDuel} disabled={isPending} className={`${baseClasses} ${isPending ? disabledClasses : actionClasses}`}>
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Swords className="w-6 h-6" />}
                <span>Accept Challenge</span>
            </button>
        );
    } else {
        return (
            <button onClick={handleSwapToJoin} className={`${baseClasses} ${actionClasses}`}>
                <ArrowLeftRight className="w-6 h-6" />
                <span>Swap to Join</span>
            </button>
        );
    }
};