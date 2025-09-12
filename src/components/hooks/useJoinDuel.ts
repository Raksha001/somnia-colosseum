import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';


// NEW: Complete contract ABI for joinDuel function

const DUEL_CONTRACT_ADDRESS = "0x0F98B3c8C7C5E5D5f02B7D725267ada38168728E"

const DUEL_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "duelId", "type": "uint256"}],
    "name": "joinDuel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "duelId", "type": "uint256"}],
    "name": "getDuel",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "address", "name": "opponent", "type": "address"},
          {"internalType": "address", "name": "tokenAddress", "type": "address"},
          {"internalType": "uint256", "name": "wagerAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "duration", "type": "uint256"},
          {"internalType": "uint256", "name": "startTime", "type": "uint256"},
          {"internalType": "uint256", "name": "endTime", "type": "uint256"},
          {"internalType": "bool", "name": "resolved", "type": "bool"},
          {"internalType": "address", "name": "winner", "type": "address"},
          {"internalType": "uint8", "name": "status", "type": "uint8"}
        ],
        "internalType": "struct Duel.DuelInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
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

export const useJoinDuel = () => {
    const queryClient = useQueryClient();
    const { writeContractAsync: joinDuel, data: hash, isPending, error } = useWriteContract();

    return useMutation({
        mutationFn: async ({ duelId }: { duelId: number }) => {
            console.log('Executing joinDuel transaction for duel ID:', duelId);
            
            const txHash = await joinDuel({
                address: DUEL_CONTRACT_ADDRESS,
                abi: DUEL_ABI,
                functionName: 'joinDuel',
                args: [BigInt(duelId)],
            });

            return { hash: txHash };
        },
        onSuccess: (data, variables) => {
            console.log('Join duel transaction sent:', data.hash);
            queryClient.invalidateQueries({ queryKey: ['duels'] });
            queryClient.invalidateQueries({ queryKey: ['duel', variables.duelId] });
        },
        onError: (error) => {
            console.error('Failed to join duel:', error);
        },
    });
};