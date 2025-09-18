"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { X, ArrowUpDown, Loader2, ChevronDown } from 'lucide-react';
import { useSwapStore } from '../../hooks/use-swap-store';
import { useDebounce } from '../../hooks/use-debounce';
import { type Token, SOMNIA_ROUTER_ADDRESS, WSTT_ADDRESS, routerAbi, erc20Abi } from '../../lib/constants';
import { TokenSelectDialog } from './TokenSelectDialog';

// Helper hook to get quote from the router
function useSomniaAmountsOut(amountIn: string, tokenIn: Token, tokenOut: Token) {
    const debouncedAmountIn = useDebounce(amountIn, 300);

    const path: [Address, Address] | undefined =
        tokenIn.address && tokenOut.address ? [
            tokenIn.isNative ? WSTT_ADDRESS : tokenIn.address as Address,
            tokenOut.isNative ? WSTT_ADDRESS : tokenOut.address as Address
        ] : undefined;

    const { data: amountsOutData, isLoading, isError, error } = useReadContract({
        address: SOMNIA_ROUTER_ADDRESS,
        abi: routerAbi,
        functionName: 'getAmountsOut',
        args: [
            debouncedAmountIn && parseFloat(debouncedAmountIn) > 0 ? parseUnits(debouncedAmountIn, tokenIn.decimals) : BigInt(0),
            path!
        ],
        query: {
            enabled: !!debouncedAmountIn && !!path && parseFloat(debouncedAmountIn) > 0,
            staleTime: 10000,
            select: (data) => data?.[1] ? formatUnits(data[1], tokenOut.decimals) : '',
        }
    });

    if (isError) {
        console.error("Quote fetching error:", error?.message);
    }
    
    const isActuallyLoading = isLoading && !!debouncedAmountIn && parseFloat(debouncedAmountIn) > 0 && !isError;

    return { amountOut: amountsOutData ?? '', isLoading: isActuallyLoading };
}

// --- Main Modal Component ---
interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose }) => {
    const { address } = useAccount();
    const {
        tokenIn, tokenOut, amountIn, slippage, deadline,
        setTokenIn, setTokenOut, setAmountIn, setAmountOut, switchTokens
    } = useSwapStore();
    
    const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
    const [activeSelector, setActiveSelector] = useState<'in' | 'out'>('in');

    const currentAmountOut = useSwapStore(s => s.amountOut);
    const { amountOut: calculatedAmountOut, isLoading: isLoadingAmountOut } = useSomniaAmountsOut(amountIn, tokenIn, tokenOut);
    
    useEffect(() => {
        setAmountOut(calculatedAmountOut);
    }, [calculatedAmountOut, setAmountOut]);

    const { data: nativeBalance } = useBalance({ address, watch: true });
    const { data: tokenInBalanceData } = useReadContract({
        address: tokenIn.isNative ? undefined : tokenIn.address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address && !tokenIn.isNative }
    });
    const tokenInBalance = tokenIn.isNative ? nativeBalance?.value : tokenInBalanceData;

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenIn.address as Address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address!, SOMNIA_ROUTER_ADDRESS],
        query: { enabled: !!address && !tokenIn.isNative },
    });

    const { data: approveHash, writeContract: approve, isPending: isApproving } = useWriteContract();
    const { data: swapHash, writeContract: swap, isPending: isSwapping } = useWriteContract();
    
    const { isLoading: isConfirmingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isLoading: isConfirmingSwap, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ hash: swapHash });

    useEffect(() => {
        if (isApprovalSuccess) { refetchAllowance(); }
        if (isSwapSuccess) { setAmountIn(''); }
    }, [isApprovalSuccess, isSwapSuccess, refetchAllowance, setAmountIn]);

    const handleTokenSelect = (selectedToken: Token) => {
        if (activeSelector === 'in') {
            if (selectedToken.address === tokenOut.address) {
                switchTokens();
            } else {
                setTokenIn(selectedToken);
            }
        } else {
            if (selectedToken.address === tokenIn.address) {
                switchTokens();
            } else {
                setTokenOut(selectedToken);
            }
        }
        setIsTokenSelectOpen(false);
    };
    
    const handleApprove = () => {
        if (!amountIn || tokenIn.isNative || !tokenIn.address) return;
        approve({
            address: tokenIn.address,
            abi: erc20Abi,
            functionName: 'approve',
            args: [SOMNIA_ROUTER_ADDRESS, parseUnits(amountIn, tokenIn.decimals)]
        });
    };
    const handleSwap = () => {
        if (!amountIn || !currentAmountOut || !address || !tokenIn.address || !tokenOut.address) return;
        const amountOutMin = parseUnits((parseFloat(currentAmountOut) * (1 - slippage / 100)).toString(), tokenOut.decimals);
        const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + deadline * 60);
        const path: [Address, Address] = [
            tokenIn.isNative ? WSTT_ADDRESS : tokenIn.address,
            tokenOut.isNative ? WSTT_ADDRESS : tokenOut.address,
        ];
        if (tokenIn.isNative) {
            swap({
                address: SOMNIA_ROUTER_ADDRESS,
                abi: routerAbi,
                functionName: 'swapExactETHForTokens',
                args: [amountOutMin, path, address, deadlineTimestamp],
                value: parseUnits(amountIn, tokenIn.decimals),
            });
        } else if (tokenOut.isNative) {
            swap({
                address: SOMNIA_ROUTER_ADDRESS,
                abi: routerAbi,
                functionName: 'swapExactTokensForETH',
                args: [parseUnits(amountIn, tokenIn.decimals), amountOutMin, path, address, deadlineTimestamp],
            });
        }
    };
    
    const hasInsufficientBalance = amountIn && tokenInBalance !== undefined ? parseUnits(amountIn, tokenIn.decimals) > tokenInBalance : false;
    const needsApproval = !tokenIn.isNative && amountIn && allowance !== undefined ? parseUnits(amountIn, tokenIn.decimals) > allowance : false;
    const isPending = isApproving || isSwapping || isConfirmingApproval || isConfirmingSwap;
    const fromAmountDisplay = tokenInBalance !== undefined ? parseFloat(formatUnits(tokenInBalance, tokenIn.decimals)).toFixed(4) : '0.00';

    const renderButton = () => {
        const baseClasses = "w-full py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 text-lg";
        if (!address) {
            return <button disabled className={`${baseClasses} bg-[var(--border-color)]/30 text-[var(--text-primary)]/50 cursor-not-allowed`}>Connect Wallet</button>;
        }
        if (hasInsufficientBalance) {
            return <button disabled className={`${baseClasses} bg-[var(--semantic-red)]/20 text-[var(--semantic-red)] cursor-not-allowed`}>Insufficient {tokenIn.symbol} Balance</button>;
        }
        const actionButtonClasses = "text-white bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] shadow-[0_0_25px_var(--accent-purple)] hover:shadow-[0_0_40px_var(--accent-magenta)] hover:scale-105";
        const disabledButtonClasses = "bg-[var(--border-color)]/30 text-[var(--text-primary)]/50 cursor-not-allowed";
        if (needsApproval) {
            return (
                <button onClick={handleApprove} disabled={isPending || !amountIn || parseFloat(amountIn) <= 0} className={`${baseClasses} ${isPending || !amountIn || parseFloat(amountIn) <= 0 ? disabledButtonClasses : actionButtonClasses}`}>
                    {isApproving || isConfirmingApproval ? <Loader2 className="animate-spin" /> : null}
                    <span>{isApproving || isConfirmingApproval ? 'Approving...' : `Approve ${tokenIn.symbol}`}</span>
                </button>
            );
        }
        return (
            <button onClick={handleSwap} disabled={isPending || !amountIn || !currentAmountOut} className={`${baseClasses} ${isPending || !amountIn || !currentAmountOut ? disabledButtonClasses : actionButtonClasses}`}>
                {isSwapping || isConfirmingSwap ? <Loader2 className="animate-spin" /> : null}
                <span>{isSwapping || isConfirmingSwap ? 'Swapping...' : 'Swap'}</span>
            </button>
        );
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                <div className="relative font-display bg-[var(--bg-dark-purple)]/80 border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Swap Terminal</h2>
                        <button onClick={onClose} className="p-2 text-[var(--text-primary)]/70 hover:text-white hover:bg-[var(--border-color)]/50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative group bg-black/30 p-4 rounded-xl border border-[var(--border-color)] focus-within:border-[var(--primary-cyan)] transition-colors">
                        <div className="absolute -inset-px bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-magenta)] rounded-xl blur opacity-0 group-focus-within:opacity-75 transition duration-300 -z-10"></div>
                        <div className="flex justify-between text-xs text-[var(--text-primary)] opacity-70 mb-1">
                            <span>You Pay</span>
                            <span>Balance: {fromAmountDisplay}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} placeholder="0.0" className="bg-transparent text-3xl font-semibold text-white w-full outline-none" />
                            <button onClick={() => { setActiveSelector('in'); setIsTokenSelectOpen(true); }} className="flex items-center space-x-2 bg-[var(--border-color)]/50 p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors">

                                <span className="text-xl font-bold text-white">{tokenIn.symbol}</span>
                                <ChevronDown className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center my-[-8px] z-10 relative">
                        <button onClick={switchTokens} className="p-2 bg-black/30 border-2 border-[var(--border-color)] rounded-full hover:border-[var(--primary-cyan)] hover:rotate-180 transition-all duration-300">
                            <ArrowUpDown className="w-5 h-5 text-[var(--primary-cyan)]" />
                        </button>
                    </div>

                    <div className="bg-black/30 p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="flex justify-between text-xs text-[var(--text-primary)] opacity-70 mb-1">
                            <span>You Receive (Estimated)</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <input readOnly value={isLoadingAmountOut ? '...' : (parseFloat(currentAmountOut || '0').toFixed(6))} className="bg-transparent text-3xl font-semibold text-white/80 w-full outline-none" />
                            <button onClick={() => { setActiveSelector('out'); setIsTokenSelectOpen(true); }} className="flex items-center space-x-2 bg-[var(--border-color)]/50 p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors">
                                <span className="text-xl font-bold text-white">{tokenOut.symbol}</span>
                                <ChevronDown className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        {renderButton()}
                    </div>
                </div>
            </div>

            <TokenSelectDialog
                isOpen={isTokenSelectOpen}
                onClose={() => setIsTokenSelectOpen(false)}
                onSelect={handleTokenSelect}
            />
        </>,
        document.body
    );
};