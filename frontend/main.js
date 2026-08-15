const PROXY = "0xb19d70B754Ffb132ffDDa379a835d177DABdD25e";
const CHAIN_ID_HEX = "0x164ce"; // 91342
const RPC_URL = "https://sepolia-rpc.giwa.io";

const ABI = [
  "function owner() view returns (address)",
  "function tradingBot() view returns (address)",
  "function userVestings(address) view returns (uint256 amount, uint256 releaseTime)",
  "function setTradingBot(address _bot)",
  "function processPayment(address payable recipient, uint256 amount)",
  "function setVesting(address beneficiary, uint256 amount, uint256 delay)",
  "function claimVesting()",
  "function executeTrade(address target, bytes calldata data, uint256 value) payable",
  "event PaymentProcessed(address indexed to, uint256 amount)",
  "event TradeExecuted(address indexed target, uint256 amount)",
  "event VestingSet(address indexed beneficiary, uint256 amount, uint256 releaseTime)",
  "event TradingBotUpdated(address indexed previousBot, address indexed newBot)"
];

let provider, signer, contract, userAddress;

const consoleEl = document.getElementById("console");

function log(msg, type = "info") {
  const time = new Date().toLocaleTimeString();
  const color = type === "error" ? "#f87171" : type === "success" ? "#34d399" : "#94a3b8";
  consoleEl.innerHTML += `<br><span style="color:${color}">[${time}] ${msg}</span>`;
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function ensureCorrectNetwork() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: "GIWA Sepolia",
          rpcUrls: [RPC_URL],
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://sepolia-explorer.giwa.io"]
        }],
      });
    } else {
      throw error;
    }
  }
}

async function connect() {
  if (!window.ethereum) {
    log("MetaMask not detected", "error");
    return;
  }

  try {
    log("Connecting and switching to GIWA Sepolia...");
    await ensureCorrectNetwork();

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(PROXY, ABI, signer);

    document.getElementById("connectBtn").innerText =
      userAddress.slice(0, 6) + "..." + userAddress.slice(-4);

    log(`Connected: ${userAddress}`, "success");
    await refreshState();
  } catch (err) {
    log("Connection failed: " + (err.message || err), "error");
  }
}

async function refreshState() {
  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  try {
    const readContract = new ethers.Contract(PROXY, ABI, provider);

    const [owner, bot, balance] = await Promise.all([
      readContract.owner(),
      readContract.tradingBot(),
      provider.getBalance(PROXY)
    ]);

    document.getElementById("ownerAddr").innerText = owner.slice(0, 6) + "..." + owner.slice(-4);
    document.getElementById("botAddr").innerText =
      (bot === ethers.ZeroAddress) ? "Not set" : bot.slice(0, 6) + "..." + bot.slice(-4);
    document.getElementById("vaultBalance").innerText =
      parseFloat(ethers.formatEther(balance)).toFixed(5) + " ETH";

    log("Contract state refreshed successfully", "success");
  } catch (err) {
    log("Failed to refresh state: " + (err.shortMessage || err.message), "error");
    console.error(err);
  }
}

async function checkMyVesting() {
  if (!contract) return log("Please connect wallet first", "error");
  try {
    const v = await contract.userVestings(userAddress);
    if (v.amount === 0n) {
      log("No vesting found for your address");
    } else {
      const date = new Date(Number(v.releaseTime) * 1000).toLocaleString();
      log(`Your vesting: ${ethers.formatEther(v.amount)} ETH | Release: ${date}`, "success");
    }
  } catch (err) {
    log(err.shortMessage || err.message, "error");
  }
}

async function setBot() {
  if (!contract) return log("Please connect wallet first", "error");
  const addr = document.getElementById("newBotInput")?.value.trim();
  if (!ethers.isAddress(addr)) return log("Invalid address", "error");

  try {
    log("Sending setTradingBot...");
    const tx = await contract.setTradingBot(addr);
    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("Trading Bot updated successfully", "success");
    await refreshState();
  } catch (err) {
    log("Failed (probably not owner): " + (err.shortMessage || err.message), "error");
  }
}

async function processPayment() {
  if (!contract) return log("Please connect wallet first", "error");
  const to = document.getElementById("payToInput")?.value.trim();
  const amount = document.getElementById("payAmountInput")?.value;
  if (!ethers.isAddress(to) || !amount) return log("Invalid input", "error");

  try {
    log("Sending processPayment...");
    const tx = await contract.processPayment(to, ethers.parseEther(amount));
    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("Payment processed successfully", "success");
    await refreshState();
  } catch (err) {
    log("Failed: " + (err.shortMessage || err.message), "error");
  }
}

async function setVesting() {
  if (!contract) return log("Please connect wallet first", "error");
  const to = document.getElementById("vestToInput")?.value.trim();
  const amount = document.getElementById("vestAmountInput")?.value;
  const delay = document.getElementById("vestDelayInput")?.value || "60";

  if (!ethers.isAddress(to) || !amount) return log("Invalid input", "error");

  try {
    log("Sending setVesting...");
    const tx = await contract.setVesting(to, ethers.parseEther(amount), delay);
    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("Vesting set successfully", "success");
  } catch (err) {
    log("Failed: " + (err.shortMessage || err.message), "error");
  }
}

async function claimVesting() {
  if (!contract) return log("Please connect wallet first", "error");
  try {
    log("Calling claimVesting...");
    const tx = await contract.claimVesting();
    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("Vesting claimed successfully", "success");
    await refreshState();
  } catch (err) {
    log("Failed: " + (err.shortMessage || err.message), "error");
  }
}

async function execTrade() {
  if (!contract) return log("Please connect wallet first", "error");
  try {
    log("Calling executeTrade (only authorized bot can succeed)...");
    const tx = await contract.executeTrade(userAddress, "0x", 0, { value: 0 });
    log("Transaction sent: " + tx.hash);
    await tx.wait();
    log("Trade executed successfully", "success");
  } catch (err) {
    log("Failed (expected if you are not the trading bot): " + (err.shortMessage || err.message), "error");
  }
}

// Event listeners
document.getElementById("connectBtn").onclick = connect;
document.getElementById("refreshBtn").onclick = refreshState;
document.getElementById("checkVestingBtn").onclick = checkMyVesting;

document.getElementById("setBotBtn")?.addEventListener("click", setBot);
document.getElementById("payBtn")?.addEventListener("click", processPayment);
document.getElementById("setVestBtn")?.addEventListener("click", setVesting);
document.getElementById("claimBtn")?.addEventListener("click", claimVesting);
document.getElementById("execTradeBtn")?.addEventListener("click", execTrade);

// Init
if (window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
}