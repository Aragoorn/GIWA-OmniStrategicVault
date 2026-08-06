import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { GIWAOmniStrategicVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GIWAOmniStrategicVault", function () {
  let vault: GIWAOmniStrategicVault;
  let owner: SignerWithAddress;
  let tradingBot: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, tradingBot, user] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("GIWAOmniStrategicVault");
    
    // Deploy using UUPS proxy pattern
    vault = (await upgrades.deployProxy(VaultFactory, [], {
      initializer: "initialize",
    })) as unknown as GIWAOmniStrategicVault;
  });

  it("Should initialize correctly and set owner", async function () {
    expect(await vault.owner()).to.equal(owner.address);
  });

  it("Should allow owner to set trading bot", async function () {
    await vault.setTradingBot(tradingBot.address);
    expect(await vault.tradingBot()).to.equal(tradingBot.address);
  });

  it("Should allow owner to set vesting and user to claim after delay", async function () {
    const depositAmount = ethers.parseEther("1.0");
    const delay = 60; // 60 seconds

    // Send Ether to the contract to fund payouts and vesting liquidity
    await owner.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("5.0"),
    });

    // Set vesting for the user
    await vault.setVesting(user.address, depositAmount, delay);

    // Verify the registered vesting details
    const vestingInfo = await vault.userVestings(user.address);
    expect(vestingInfo.amount).to.equal(depositAmount);

    // Attempt to claim before the lock period expires (should revert)
    await expect(vault.connect(user).claimVesting()).to.be.revertedWith("Not released yet");

    // Fast-forward time in the Hardhat test network
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine", []);

    // Successful claim after the delay has passed
    await expect(vault.connect(user).claimVesting())
      .to.changeEtherBalance(user, depositAmount);
  });

  it("Should allow authorized trading bot to execute trades", async function () {
    await vault.setTradingBot(tradingBot.address);

    // Fund the contract with balance
    await owner.sendTransaction({
      to: await vault.getAddress(),
      value: ethers.parseEther("2.0"),
    });

    const target = user.address;
    const value = ethers.parseEther("0.5");
    const data = "0x";

    await expect(
      vault.connect(tradingBot).executeTrade(target, data, value, { value: 0 })
    )
      .to.emit(vault, "TradeExecuted")
      .withArgs(target, value);
  });

  it("Should allow owner to upgrade the contract (UUPS)", async function () {
    const VaultFactoryV2 = await ethers.getContractFactory("GIWAOmniStrategicVault");
    
    // Test proxy upgrade
    const upgradedVault = await upgrades.upgradeProxy(
      await vault.getAddress(),
      VaultFactoryV2
    );

    expect(await upgradedVault.owner()).to.equal(owner.address);
  });
});
