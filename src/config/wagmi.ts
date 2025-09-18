import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat, somniaTestnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Somnia Colosseum',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "", 
  chains: [
    //mainnet,
    somniaTestnet,
    ...(import.meta.env.VITE_ENABLE_TESTNETS === 'true' ? [sepolia, hardhat, somniaTestnet ] : [somniaTestnet]),
  ],
  ssr: false,
});