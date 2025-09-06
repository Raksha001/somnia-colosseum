require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    somnia: {
      chainId: 50312,
      url: process.env.SOMANIA_RPC_URL ||"https://dream-rpc.somnia.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [""],
    },
  },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  // etherscan: {
  //   apiKey: {
  //     somnia: "ETHERSCAN_API_KEY",
  //   },
  //   customChains: [
  //     {
  //       network: "somnia",
  //       chainId: 50312,
  //       urls: {
  //         apiURL: "https://shannon-explorer.somnia.network/api",
  //         browserURL: "https://shannon-explorer.somnia.network",
  //       },
  //     },
  //   ],
  // },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};