import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat, somniaTestnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Somnia Colosseum',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID|| '', // Get from WalletConnect Cloud
  chains: [
    //mainnet,
    somniaTestnet,
    ...(import.meta.env.VITE_ENABLE_TESTNETS === 'true' ? [sepolia, hardhat, somniaTestnet ] : [somniaTestnet]),
  ],
  ssr: false,
});