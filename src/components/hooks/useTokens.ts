import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock token data for development
const mockTokens = [
  {
    address: '0xA0b86a33E6441b9a7B9A37E47E68cd68E4ef7a4e',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png'
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png'
  },
  {
    address: '0xA0b473D55CdE6e5c6A3ae168a4C8a01a7C95E9E9',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png'
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/4943.png'
  }
];

export const useTokens = () => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/swap/tokens`);
        return Object.values(data.data || {});
      } catch (error) {
        console.warn('Failed to fetch tokens from API, using mock data');
        return mockTokens;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

interface ApiToken {
  address: string;
  symbol: string;
  name: string;
  decimals: string;
  icon_url: string | null;
  // This is the property that has the logo in the constants file
  logo?: string; 
}

// The async function that fetches the data directly from the Somnia API
const fetchSomniaTokens = async (): Promise<ApiToken[]> => {
  const { data } = await axios.get('https://somnia.w3us.site/api/v2/tokens?type=ERC-20');
  // The API returns an object with an 'items' array
  return data.items || [];
};

/**
 * A custom hook to fetch and cache the list of all supported ERC-20 tokens on Somnia.
 */
export const useToken = () => {
  return useQuery({
    // A unique key for React Query to cache this data
    queryKey: ['somnia-tokens'],
    
    // The function that fetches the data
    queryFn: fetchSomniaTokens,
    
    // Cache the data for 1 hour, as the token list doesn't change often.
    staleTime: 1000 * 60 * 60,
    
    // Prevent unnecessary refetches when the user switches browser tabs.
    refetchOnWindowFocus: false,
  });
};
