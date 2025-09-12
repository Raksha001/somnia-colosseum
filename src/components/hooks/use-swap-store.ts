import { create } from 'zustand';
import { type Token, DEFAULT_TOKENS } from '../lib/constants';

interface SwapState {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  slippage: number;
  deadline: number; // in minutes
  setTokenIn: (token: Token) => void;
  setTokenOut: (token: Token) => void;
  setAmountIn: (amount: string) => void;
  setAmountOut: (amount: string) => void;
  setSlippage: (slippage: number) => void;
  switchTokens: () => void;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  tokenIn: DEFAULT_TOKENS[0],   
  tokenOut: DEFAULT_TOKENS[2],  
  amountIn: '',
  amountOut: '',
  slippage: 1, // Start with 1%
  deadline: 20, // 20 minutes
  setTokenIn: (token) => set({ tokenIn: token }),
  setTokenOut: (token) => set({ tokenOut: token }),
  setAmountIn: (amount) => set({ amountIn: amount }),
  setAmountOut: (amount) => set({ amountOut: amount }),
  setSlippage: (slippage) => set({ slippage }),
  switchTokens: () => {
    const { tokenIn, tokenOut, amountIn, amountOut } = get();
    set({
      tokenIn: tokenOut,
      tokenOut: tokenIn,
      amountIn: amountOut, // Optional: you can also choose to clear amounts
      amountOut: amountIn,
    });
  },
}));