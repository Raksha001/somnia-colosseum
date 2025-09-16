import { type Address } from 'viem';

// Define a type for our tokens for better type safety
export interface Token {
  address: Address | 'native'; // Use 'native' for the native token
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  isNative?: boolean;
}

export const DUEL_CONTRACT_ADDRESS: Address = '0x0F98B3c8C7C5E5D5f02B7D725267ada38168728E';
export const SOMNIA_ROUTER_ADDRESS: Address = '0xb98c15a0dC1e271132e341250703c7e94c059e8D';
export const WSTT_ADDRESS: Address = '0xf22ef0085f6511f70b01a68f360dcc56261f768a'; // Wrapped STT

export const NATIVE_TOKEN: Token = {
  address: 'native',
  symbol: 'STT',
  name: 'Somnia Token',
  decimals: 18,
  logo: '/tokens/stt.png',
  isNative: true,
};

export const DEFAULT_TOKENS: Token[] = [
  NATIVE_TOKEN,
  {
    address: '0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76',
    symbol: 'USDT.g',
    name: 'Tether USD.g',
    decimals: 6,
    logo: '/tokens/usdt.png'
  },
  {
    address: '0xF2F773753cEbEFaF9b68b841d80C083b18C69311',
    symbol: 'NIA',
    name: 'NIA Token',
    decimals: 18,
    logo: '/tokens/nia.png'
  }
];

// Re-using the ABIs you provided
export const erc20Abi = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
] as const;
export const routerAbi = [
  {
    name: 'getAmountsOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactTokensForETH',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  },
  {
    name: 'swapExactETHForTokens',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  }
] as const;