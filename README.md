<img width="1875" height="881" alt="demo" src="https://github.com/user-attachments/assets/b2ba737f-404c-483b-b7e4-d8cad2704d92" />
<img width="1003" height="299" alt="upgrade" src="https://github.com/user-attachments/assets/e23129ad-85cd-43b5-8cae-48167535bcfd" />
<img width="979" height="944" alt="test compile" src="https://github.com/user-attachments/assets/4674cee4-3ab0-49b5-814f-ee27c75b51c0" />

# 🛡️ GIWA Omni Strategic Vault

> Enterprise-grade, UUPS upgradeable smart contract infrastructure engineered for advanced asset management, time-locked vesting, and secure AI-driven trading execution within the **GIWA** ecosystem.

---

## 🌐 Live Demo & Deployment

- **Live Frontend Dashboard:** [Netlify Live App](https://giwa-omni-vault-pro.netlify.app/)
- **Proxy Address (Main):** [`0xb19d70B754Ffb132ffDDa379a835d177DABdD25e`](https://sepolia-explorer.giwa.io/address/0xb19d70B754Ffb132ffDDa379a835d177DABdD25e)
- **Network:** GIWA Sepolia Testnet (Chain ID: `91342`)
- **Explorer:** [sepolia-explorer.giwa.io](https://sepolia-explorer.giwa.io)
- **Compiler:** Solidity 0.8.24

---

## 🚀 Deployed Contracts (GIWA Sepolia)

| Item | Address / Link |
|------|----------------|
| **Proxy (Main)** | [`0xb19d70B754Ffb132ffDDa379a835d177DABdD25e`](https://sepolia-explorer.giwa.io/address/0xb19d70B754Ffb132ffDDa379a835d177DABdD25e) |
| Network | GIWA Sepolia (Chain ID: 91342) |
| Explorer | [sepolia-explorer.giwa.io](https://sepolia-explorer.giwa.io) |

### Upgrade History
- **Initial Deployment:** Original version
- **Latest Upgrade:** Successfully performed via UUPS
- **Changes in Upgrade:** Added `ReentrancyGuardUpgradeable`, improved validations, better events and NatSpec
- **Proxy Address:** Unchanged (as designed by UUPS pattern)
- **State:** Fully preserved (balances, vestings, owner, tradingBot)

---

## ✨ Core Features

- **UUPS Upgradeable** – Logic can be upgraded without changing the proxy address or losing any state
- **AI / Algorithmic Trading Layer** – Secure `executeTrade` function restricted to authorized trading bot
- **Time-locked Vesting** – Simple and reliable claim mechanism with timestamp validation
- **Reentrancy Protection** – All value-transferring functions protected with `nonReentrant`
- **Strict Access Control** – `onlyOwner` + dedicated `tradingBot` authorization
- **Treasury Management** – Safe `processPayment` for controlled fund distribution

---

## 🔒 Security Considerations

- `ReentrancyGuardUpgradeable` on all critical functions (`processPayment`, `claimVesting`, `executeTrade`)
- Strict `onlyOwner` and `msg.sender == tradingBot` checks
- Zero-address and amount validations
- UUPS `_authorizeUpgrade` restricted exclusively to owner
- Built only with official OpenZeppelin upgradeable contracts
- No external unaudited dependencies

**Known Limitation:**  
Current vesting is single-claim (not linear). Linear vesting can be added in a future upgrade without changing the proxy address.

---

## 🗺️ Project Status & Roadmap

### ✅ Completed
- [x] UUPS Upgradeable Vault architecture
- [x] AI Trading Bot authorization layer (`executeTrade`)
- [x] Time-locked Vesting system
- [x] ReentrancyGuard protection on all value-transfer functions
- [x] Complete test suite (10 tests passing)
- [x] Live deployment on GIWA Sepolia
- [x] Successful UUPS upgrade (Proxy address preserved)
- [x] Interactive frontend demo connected to live contract

### 🚧 Next Steps
- [ ] Linear Vesting support
- [ ] Optional multi-signature owner
- [ ] Event indexing & basic analytics
- [ ] Deeper integration with GIWA ecosystem tools
- [ ] Mainnet readiness after grant feedback

### 🎯 Goal
Deliver a production-ready, secure, and fully upgradeable strategic vault that can serve as treasury + AI execution infrastructure for projects building on GIWA.

---

## 🛠️ How to Use

### Install & Test
```bash
npm install
npx hardhat compile
npx hardhat test

Upgrade (keeps the same Proxy address)
npx hardhat run scripts/upgrade.ts --network giwaSepolia

GIWAOmniStrategicVault/
├── contracts/
│   └── GIWAOmniStrategicVault.sol
├── scripts/
│   ├── deploy.ts
│   └── upgrade.ts
├── test/
│   └── GIWAOmniStrategicVault.test.ts
├── frontend/                  # Live interactive demo
│   ├── index.html
│   ├── main.js
│   └── style.css
├── hardhat.config.ts
├── package.json
└── README.md

 License MIT


