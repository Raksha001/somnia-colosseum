import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Contract ABI for createDuel function
const DUEL_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "tokenAddress", "type": "address"},
      {"internalType": "uint256", "name": "wagerAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"}
    ],
    "name": "createDuel",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// NEW: ERC20 ABI for token approval
const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface CreateDuelParams {
  tokenAddress: string;
  amount: string;
  duration: number;
}

export const useCreateDuel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // NEW: Separate hooks for approval and create transactions
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: createDuel, data: createHash } = useWriteContract();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isCreating } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  return useMutation({
    mutationFn: async (params: CreateDuelParams) => {
      const contractAddress = "0x0F98B3c8C7C5E5D5f02B7D725267ada38168728E";
      const tokenAddress = params.tokenAddress as `0x${string}`;
      const wagerAmount = parseUnits(params.amount, 18);

      console.log('Creating duel:', { tokenAddress, wagerAmount: wagerAmount.toString(), duration: params.duration });

      // NEW: Step 1 - Approve token spending
      console.log('Step 1: Approving token...');
      await approveToken({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress, wagerAmount],
      });

      // NEW: Wait for approval to complete
      if (approveHash) {
        console.log('Waiting for approval confirmation...');
        // Wait a bit for the approval to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // NEW: Step 2 - Create the duel
      console.log('Step 2: Creating duel...');
      await createDuel({
        address: contractAddress,
        abi: DUEL_ABI,
        functionName: 'createDuel',
        args: [
          tokenAddress,
          wagerAmount,
          BigInt(params.duration)
        ],
      });

      return { approveHash, createHash };
    },
    onSuccess: (data) => {
      console.log('Create duel success:', data);
      // Invalidate duels query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['duels'] });
      
      // Navigate to explorer to see the new duel
      navigate('/explorer');
    },
    onError: (error) => {
      console.error('Failed to create duel:', error);
    },
    // NEW: Add loading state that covers both approval and create
    meta: {
      isLoading: isApproving || isCreating
    }
  });
};