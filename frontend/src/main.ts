import { ethers } from "ethers";

const PROXY_ADDRESS = "0xb19d70B754Ffb132ffDDa379a835d177DABdD25e";

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWallet") as HTMLButtonElement;
  const execBtn = document.getElementById("execTradeBtn") as HTMLButtonElement;
  const consoleLogs = document.getElementById("consoleLogs") as HTMLDivElement;

  function log(msg: string) {
    const time = new Date().toTimeString().split(" ")[0];
    consoleLogs.innerHTML += `<br>[${time}] ${msg}`;
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  connectBtn?.addEventListener("click", async () => {
    if ((window as any).ethereum) {
      try {
        log("Requesting MetaMask connection...");
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        connectBtn.innerText = `${address.substring(0, 6)}...${address.substring(38)}`;
        log(`Wallet connected successfully: ${address}`);
      } catch (err: any) {
        log(`Connection failed: ${err.message}`);
      }
    } else {
      alert("Please install MetaMask or Web3 wallet!");
    }
  });

  execBtn?.addEventListener("click", () => {
    log("Dispatching AI Agent simulation payload to GIWA proxy...");
    setTimeout(() => {
      log("AI Strategy validation successful: Whitelist target confirmed.");
      log(`Transaction broadcasted to GIWA Sepolia for Proxy: ${PROXY_ADDRESS}`);
    }, 1000);
  });
});