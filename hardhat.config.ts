import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.34",
  networks: {
    giwaSepolia: {
      url: "https://sepolia.giwa.io", // (یا RPC رسمی شبکه تستنت گیوا)
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
  },
};

export default config;