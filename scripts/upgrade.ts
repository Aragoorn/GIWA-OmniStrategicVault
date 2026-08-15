import { ethers, upgrades } from "hardhat";

async function main() {
  const PROXY_ADDRESS = "0xb19d70B754Ffb132ffDDa379a835d177DABdD25e";

  console.log("Importing existing proxy...");
  console.log("Proxy:", PROXY_ADDRESS);

  // اول قرارداد فعلی را import می‌کنیم
  const VaultFactory = await ethers.getContractFactory("GIWAOmniStrategicVault");

  // ثبت Proxy قبلی در سیستم Hardhat Upgrades
  await upgrades.forceImport(PROXY_ADDRESS, VaultFactory, {
    kind: "uups",
  });

  console.log("Proxy successfully imported.");
  console.log("Now upgrading implementation...");

  // حالا ارتقا را انجام می‌دهیم
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, VaultFactory, {
    kind: "uups",
  });

  await upgraded.waitForDeployment();

  console.log("----------------------------------------");
  console.log("Upgrade successful!");
  console.log("Proxy address (unchanged):", await upgraded.getAddress());
  console.log("----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});