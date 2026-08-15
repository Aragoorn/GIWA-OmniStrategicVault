import { ethers, upgrades } from "hardhat";

async function main() {
  const PROXY_ADDRESS = "0xb19d70B754Ffb132ffDDa379a835d177DABdD25e";

  console.log("Force upgrading to new implementation...");
  console.log("Proxy:", PROXY_ADDRESS);

  const VaultFactory = await ethers.getContractFactory("GIWAOmniStrategicVault");

  // ارتقا با اجبار به دیپلوی Implementation جدید
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, VaultFactory, {
    kind: "uups",
    redeployImplementation: "always", // این خط مهم است
  });

  await upgraded.waitForDeployment();

  const newImpl = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);

  console.log("----------------------------------------");
  console.log("Upgrade successful!");
  console.log("Proxy (unchanged):", PROXY_ADDRESS);
  console.log("New Implementation:", newImpl);
  console.log("----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
