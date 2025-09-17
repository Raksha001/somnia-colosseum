Somnia Colosseum
================

### A P2P DeFi trading dueling platform on the Somnia testnet.

### 🌟 Project Overview

Somnia Colosseum is a decentralized application (dApp) that transforms DeFi trading into a competitive, skill-based social game. It provides a trustless and non-custodial platform where two traders can engage in a head-to-head "duel," wagering cryptocurrency on who can achieve a higher trading performance over a set period. The entire process—from wagering to judging and payout—is automated and secured by smart contracts and a backend referee service.

This project was built for the **Somnia hackathon**, leveraging the network's high-performance, low-latency, and EVM-compatible infrastructure to create a real-time, engaging trading experience.

### 💡 Core Concept & Vision

The core vision of Somnia Colosseum is to create a transparent and exciting environment for traders to prove their skills. Unlike traditional trading, which is often a solo endeavor, Somnia Colosseum introduces a competitive layer, measuring skill through **Profit & Loss (P&L) percentage** rather than portfolio size. This ensures a level playing field where a new trader can challenge a crypto whale.

The platform is **trustless** and **non-custodial**. Users never lose control of their main portfolio. Only the agreed-upon wager is locked in a secure, transparent smart contract escrow, whose rules are publicly verifiable and immutable.

### 🚀 Key Features

*   **P&L Percentage-Based Victory:** The fairest measure of trading skill, ensuring a level playing field for all participants.
    
*   **Trustless Smart Contract Escrow:** Wagers are secured by immutable on-chain logic, removing any need to trust a centralized party with your funds.
    
*   **Integrated Trading Interface:** The dApp features a built-in trading interface that provides a **real-time P&L chart** and allows players to swap coins directly within the application to optimize their trading strategy without ever leaving the competitive environment.
    
*   **Automated and Unbiased Judging:** The backend referee service uses reliable Somnia APIs to ensure fair and timely resolution of every duel.

### 🗺️ The User Journey: A Duel in Four Steps

1.  **Challenge Creation:** A user (the "Challenger") initiates a duel by defining the wager asset and the duration of the competition, This creates an open challenge in the app's public lobby.
    
2.  **Joining & Staking:** An "Opponent" can accept an open challenge. Both players are then prompted to deposit their wager into the Duel.sol smart contract. The dApp provides a swap function to allow users to easily convert any supported coin into the required wager asset before staking.
    
3.  **The Competition Phase:** Once both wagers are locked, the duel becomes "Active." Players trade assets directly from their personal wallets while the timer counts down.
    
4.  **Automated Resolution:** When the duel's timer expires, the backend "Referee" service is automatically triggered. It uses Somnia's APIs to get a precise value snapshot of each player's wallet at the start and end of the duel, calculates the P&L percentage, and securely calls the resolveDuel function on the smart contract to pay out the winner.
    

### 🏗️ Technical Architecture

Somnia Colosseum is built as a dApp with three core components: the Smart Contract, a Backend Service, and a Frontend Application.

<img width="800" height="500" alt="image" src="https://github.com/user-attachments/assets/3b074eb1-049d-436e-8f6b-51eb04d2e73c" />

**1\. Smart Contract:** The contract's sole purpose is to act as a secure on-chain escrow for player wagers. It holds the funds and has a permissioned resolveDuel function that can only be called by our trusted backend referee. We used **OpenZeppelin's ReentrancyGuard** for security.

*   **Frameworks:** Solidity and Hardhat.
    

**2\. Backend Service:** This service has two jobs: act as the referee and provide duel data to the frontend. It uses a scheduled job (node-cron) to check for ended duels. When a duel finishes, the backend uses **Somnia APIs** to calculate each player's P&L and trigger the final payout.

*   **Frameworks:** Node.js and Express.js.
    

**3\. Frontend Application:** The frontend is the user interface where all interactions happen. We used Wagmi and Viem hooks for all blockchain interactions, making it simple for users to connect their wallets, call contract functions, and sign transactions.

*   **Frameworks:** React, Vite, and Tailwind CSS.

**4\. External Services:** This component represents the third-party data provider. The backend service fetches portfolio, balance, and transaction data from the ORMI APIs to accurately calculate P&L and determine the winner of a duel.

*   **Frameworks: N/A (External API Provider).
    

### 🖼️ UI/UX Design

The user interface is designed to be clean, intuitive, and highly functional. It provides a seamless experience for both creating and joining duels, with a clear view of live competition data.

### ⚙️ Getting Started

To run this project locally, follow these steps:

1.  **Git clone**
```
git clone https://github.com/Raksha001/somnia-colosseum.git
cd somnia-colosseum
```
    
2.  **Install packages using npm**
```
npm install
cd backend
npm install
cd ..
```
    
3.  **Configure environment variables:**
    
    Create a .env file in the root directory.
        
    Add your Somnia Testnet RPC URL and private keys
        
4.  **Deploy the smart contract:**
    
    Run the deployment script using Hardhat.
        
    Update the contract address in your frontend configuration.
        
5. **Run code**
In one terminal
```npm run dev```
In another terminal
```
cd backend
npm run dev
```
    

### 🏆 Hackathon Submission Details

*   **Project Name:** Somnia Colosseum
    
*   **Track:** DeFi & Trading
    
*   **Submission Date:** 19-09-25
    
*   **Team Members:** @sharwin, @raksha

*   **Demo Link:** [Demo](https://drive.google.com/file/d/1mqUF5IDUzTUijtu8a_11JTP50v-sNrzB/view?usp=drive_link)
    
*   **Pitch Deck Link:** [Pitch Deck](https://drive.google.com/file/d/1iCtiJu3VqAhZHHelQ-eh4KLxW8HVlUf8/view?usp=sharing)
    
*   **Contract Deployed Address:** **0x0F98B3c8C7C5E5D5f02B7D725267ada38168728E**
    
*   **Somnia Router Addres:**: 0xb98c15a0dC1e271132e341250703c7e94c059e8D
    

### 🤝 Contributions

We welcome contributions! Feel free to open an issue or submit a pull request if you find a bug or have an idea for an enhancement.
