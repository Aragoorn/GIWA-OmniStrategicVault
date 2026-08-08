<img width="1080" height="1020" alt="Screenshot (2061)" src="https://github.com/user-attachments/assets/3fd43add-4d89-40ee-a1e4-406dabe2728f" />

## 🌐 Live Demo & Deployment

* **Live Frontend Dashboard:** [Netlify Live App](https://exquisite-crumble-c17a69.netlify.app)
* **GIWA Explorer (Proxy Address):** [0xb19d70B754Ffb132ffDDa379a835d177DABdD25e](https://sepolia.giwa.io)
* **Network:** GIWA Sepolia Testnet
* **Compiler Version:** Solidity 0.8.34
# 🛡️ GIWA Omni Strategic Vault

> Enterprise-grade, UUPS upgradeable smart contract infrastructure engineered for advanced asset management, time-locked vesting, and secure AI-driven trading execution within the **GIWA** ecosystem.

---

## 🌟 Overview

**GIWAOmniStrategicVault** is a next-generation decentralized vault designed to bridge secure, non-custodial treasury management with automated execution strategies. Moving beyond traditional static vaults, this architecture combines future-proof upgradeability, granular access controls, programmatic time-locks (`Vesting`), and a dedicated authorization bridge for algorithmic trading bots or AI agents..

---

## 🚀 Deployed Contracts (GIWA Sepolia Testnet) 

* **Proxy Contract Address:** `0xb19d70B754Ffb132ffDDa379a835d177DABdD25e`
* **Implementation Contract Address:** `0xd6CD32896FB14387cF37E63FA04d6bc37897A496`
* **Network:** GIWA Sepolia Testnet
* **Explorer Verification:** Verified and interactive via block explorer.

---

## 🛠️ Core Architecture & Technical Features

1. **Upgradeable UUPS Proxy Pattern (`UUPSUpgradeable`):**
   * Built using OpenZeppelin upgradeable standards (`solidity 0.8.34`).
   * Allows seamless logic upgrades without altering state variables, user balances, or interrupting deployed liquidity.

2. **AI & Algorithmic Execution Layer (`executeTrade`):**
   * Features a secure authorization mechanism (`setTradingBot` & `executeTrade`).
   * Enables verified AI trading agents to execute programmatic on-chain strategies securely with explicit call data and value verifications.

3. **Programmatic Time-Locked Vesting (`Vesting`):**
   * Implements robust linear or scheduled token distribution (`setVesting` & `claimVesting`).
   * Guarantees trustless, timestamp-verified fund releases for contributors, protocols, or DAOs.

4. **Secure Fund Routing & Access Control (`onlyOwner`):**
   * Strict modifier enforcement and low-level call validations (`processPayment`) to eliminate re-entrancy risks and secure protocol treasuries.

---

## 📂 Project Structure

```text
GIWAOmniStrategicVault/
├── contracts/
│   └── GIWAOmniStrategicVault.sol     # Main UUPS upgradeable vault contract
├── scripts/
│   └── deploy.ts                      # Hardhat deployment script for UUPS Proxy
├── deployed_addresses.txt             # Live testnet deployment logs
├── hardhat.config.ts                  # Hardhat network & compiler configurations
├── package.json                       # Project dependencies & scripts
└── tsconfig.json                      # TypeScript configurations
