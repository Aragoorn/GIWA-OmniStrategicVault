// scripts/deploy.ts
import { ethers, upgrades } from "hardhat";

async function main() {
  const VaultFactory = await ethers.getContractFactory("GIWAOmniStrategicVault");
  
  console.log("Deploying GIWAOmniStrategicVault (UUPS Proxy)...");
  
  const vault = await upgrades.deployProxy(VaultFactory, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await vault.waitForDeployment();

  console.log("Proxy deployed to:", await vault.getAddress());
  console.log("Implementation:", await upgrades.erc1967.getImplementationAddress(await vault.getAddress()));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
