import { ethers, upgrades } from "hardhat";

async function main() {
  const GIWAOmniStrategicVault = await ethers.getContractFactory("GIWAOmniStrategicVault");
  console.log("Deploying GIWAOmniStrategicVault (UUPS Proxy)...");

  const vault = await upgrades.deployProxy(GIWAOmniStrategicVault, [], {
    initializer: "initialize",
  });

  await vault.waitForDeployment();
  const proxyAddress = await vault.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("GIWAOmniStrategicVault Proxy deployed to:", proxyAddress);
  console.log("Implementation address deployed to:", implementationAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});