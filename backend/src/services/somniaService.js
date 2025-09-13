import axios from 'axios';
import { ethers } from 'ethers';

// --- Configuration (matching the working React component) ---
const SOMNIA_RPC_URL = "https://dream-rpc.somnia.network";
const SOMNIA_ROUTER_ADDRESS = "0xb98c15a0dC1e271132e341250703c7e94c059e8D";
const WSTT_ADDRESS = "0xf22ef0085f6511f70b01a68f360dcc56261f768a"; // WSTT (Wrapped STT)
const REFERENCE_STABLECOIN_ADDRESS = "0xda4fde38be7a2b959bf46e032ecfa21e64019b76"; // USDT.g
const REFERENCE_STABLECOIN_DECIMALS = 18; // USDT.g Decimals

// Router ABI (matching the working React component)
const routerAbi = [
    "function getAmountsOut(uint256 amountIn, address[] memory path) external view returns (uint256[] memory amounts)",
    "function swapExactETHForTokens(uint256 amountOutMin, address[] memory path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] memory path, address to, uint256 deadline) external returns (uint256[] memory amounts)"
];

class SomniaService {
    constructor() {
        this.somniaApiClient = axios.create({
            baseURL: 'https://api.subgraph.somnia.network/public_api/data_api/somnia/v1',
            timeout: 20000,
            headers: {
                'Authorization': `Bearer ${process.env.SOMNIA_BEARER_TOKEN}`
            }
        });
        
        this.provider = new ethers.JsonRpcProvider(SOMNIA_RPC_URL);
        this.routerContract = new ethers.Contract(SOMNIA_ROUTER_ADDRESS, routerAbi, this.provider);
    }

    /**
     * Create swap path exactly like the working React component
     * This follows the same logic as the useSomniaAmountsOut hook
     */
    createSwapPath(tokenInAddress, tokenOutAddress, tokenInIsNative = false, tokenOutIsNative = false) {
        // Handle native STT tokens by using WSTT
        const fromAddress = tokenInIsNative ? WSTT_ADDRESS : tokenInAddress;
        const toAddress = tokenOutIsNative ? WSTT_ADDRESS : tokenOutAddress;
        
        return [fromAddress, toAddress];
    }

    /**
     * Check if a token is native STT (similar to the React component logic)
     */
    isNativeToken(tokenAddress) {
        return tokenAddress?.toLowerCase() === 'native' || 
               tokenAddress?.toLowerCase() === WSTT_ADDRESS.toLowerCase() ||
               !tokenAddress; // Handle cases where address might be null/undefined for native
    }

    /**
     * Get token value using the exact same routing logic as the working swap
     */
    async getTokenValue(tokenAddress, rawBalance, tokenDecimals = 18) {
        if (!rawBalance || BigInt(rawBalance) === 0n) {
            return 0;
        }

        const amountIn = BigInt(rawBalance);
        
        // If it's already the reference stablecoin, return face value
        if (tokenAddress.toLowerCase() === REFERENCE_STABLECOIN_ADDRESS.toLowerCase()) {
            return parseFloat(ethers.formatUnits(amountIn, REFERENCE_STABLECOIN_DECIMALS));
        }

        try {
            // Create path exactly like the React component does
            // Token -> Reference Stablecoin (using the same logic as useSomniaAmountsOut)
            const path = this.createSwapPath(
                tokenAddress, 
                REFERENCE_STABLECOIN_ADDRESS, 
                this.isNativeToken(tokenAddress), 
                false // USDT.g is not native
            );

            console.log(`Getting quote for token ${tokenAddress}`);
            console.log(`Amount in: ${amountIn.toString()}`);
            console.log(`Path: ${path.join(' -> ')}`);
            
            // Call getAmountsOut exactly like the React component
            const amountsOut = await this.routerContract.getAmountsOut(amountIn, path);
            
            if (amountsOut && amountsOut.length >= 2) {
                // Take the last amount (output amount) - same as React component: data[1]
                const outputAmount = amountsOut[amountsOut.length - 1];
                const valueInStablecoin = ethers.formatUnits(outputAmount, REFERENCE_STABLECOIN_DECIMALS);
                const value = parseFloat(valueInStablecoin);
                
                console.log(`Quote successful: ${value} USDT.g`);
                return value;
            } else {
                console.warn(`Invalid amountsOut response for ${tokenAddress}:`, amountsOut);
                return 0;
            }
        } catch (error) {
            console.error(`Quote failed for token ${tokenAddress}:`, error.message);
            
            // If direct path fails, try routing through WSTT (like the swap logic might)
            try {
                console.log(`Trying alternative path through WSTT...`);
                
                // Two-hop path: Token -> WSTT -> USDT.g
                const alternativePath = [tokenAddress, WSTT_ADDRESS, REFERENCE_STABLECOIN_ADDRESS];
                const amountsOut = await this.routerContract.getAmountsOut(amountIn, alternativePath);
                
                if (amountsOut && amountsOut.length >= 3) {
                    const outputAmount = amountsOut[amountsOut.length - 1];
                    const valueInStablecoin = ethers.formatUnits(outputAmount, REFERENCE_STABLECOIN_DECIMALS);
                    const value = parseFloat(valueInStablecoin);
                    
                    console.log(`Alternative quote successful: ${value} USDT.g`);
                    return value;
                }
            } catch (altError) {
                console.error(`Alternative path also failed:`, altError.message);
            }
            
            return 0;
        }
    }

    /**
     * The core function that fetches balances and calculates their total value on-chain.
     * @param {string} address The user's wallet address.
     * @returns {Promise<{totalValue: number, tokens: any[]}>}
     */
    async getPortfolio(address) {
        try {
            console.log(`Fetching portfolio for address: ${address}`);
            
            // 1. Fetch all ERC20 balances from Somnia's Subgraph API
            const balanceResponse = await this.somniaApiClient.get(`/address/${address}/balance/erc20`);
            const balances = balanceResponse.data?.erc20TokenBalances || [];
            
            console.log(`Found ${balances.length} token balances`);
            
            if (balances.length === 0) {
                return { totalValue: 0, tokens: [] };
            }

            // 2. For each token, calculate its value using the same logic as the working swap
            const valuePromises = balances.map(async (token) => {
                const tokenAddress = token.contract.address;
                const tokenDecimals = token.contract.decimals || 18;
                
                console.log(`\nProcessing token: ${token.contract.name} (${token.contract.symbol})`);
                console.log(`Address: ${tokenAddress}`);
                console.log(`Decimals: ${tokenDecimals}`);
                console.log(`Balance: ${token.balance}, Raw: ${token.raw_balance}`);

                try {
                    const value_usd = await this.getTokenValue(tokenAddress, token.raw_balance, tokenDecimals);
                    console.log(`Token ${token.contract.symbol} value: $${value_usd}`);
                    
                    return { ...token, value_usd };
                } catch (error) {
                    console.error(`Error calculating value for ${token.contract.symbol}:`, error.message);
                    return { ...token, value_usd: 0 };
                }
            });

            const tokensWithValue = await Promise.all(valuePromises);

            // 3. Sum the individual values to get the total portfolio value
            const totalValue = tokensWithValue.reduce((sum, token) => {
                const tokenValue = token.value_usd || 0;
                console.log(`Adding ${token.contract.symbol}: $${tokenValue}`);
                return sum + tokenValue;
            }, 0);
            
            console.log(`\nTotal portfolio value: $${totalValue.toFixed(7)}`);
            
            return { 
                totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
                tokens: tokensWithValue.filter(token => token.value_usd > 0) // Only return tokens with value
            };
        } catch (error) {
            console.error(`Failed to get Somnia portfolio for ${address}:`, error.message);
            throw new Error(`Failed to get Somnia portfolio: ${error.message}`);
        }
    }
}

export const somniaService = new SomniaService();