import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    giwaSepolia: {
      url: process.env.GIWA_RPC_URL || "https://sepolia-rpc.giwa.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 91342,
    },
  },
  etherscan: {
    apiKey: {
      giwaSepolia: "abc", // یا "no-api-key" اگر API Key لازم نداشت، خالی بگذار یا هر چیزی بگذار
    },
    customChains: [
      {
        network: "giwaSepolia",
        chainId: 91342,
        urls: {
          apiURL: "https://sepolia-explorer.giwa.io/api",
          browserURL: "https://sepolia-explorer.giwa.io",
        },
      },
    ],
  },
};

export default config;
