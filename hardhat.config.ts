import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.34",
  networks: {
    giwaSepolia: {
      url: "https://sepolia.giwa.io", // (یا RPC رسمی شبکه تستنت گیوا)
      accounts: ["YOUR_PRIVATE_KEY_HERE"],
    },
  },
};

default config;