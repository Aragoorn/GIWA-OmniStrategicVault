import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { GIWAOmniStrategicVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GIWAOmniStrategicVault", function () {
  let vault: GIWAOmniStrategicVault;
  let owner: SignerWithAddress;
  let tradingBot: SignerWithAddress;
  let user: SignerWithAddress;
  let attacker: SignerWithAddress;

  beforeEach(async function () {
    [owner, tradingBot, user, attacker] = await ethers.getSigners();

    const VaultFactory = await ethers.getContractFactory("GIWAOmniStrategicVault");
    vault = (await upgrades.deployProxy(VaultFactory, [], {
      initializer: "initialize",
      kind: "uups",
    })) as unknown as GIWAOmniStrategicVault;
  });

  describe("Initialization & Ownership", function () {
    it("Should initialize correctly and set owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe("Trading Bot", function () {
    it("Should allow owner to set trading bot", async function () {
      await expect(vault.setTradingBot(tradingBot.address))
        .to.emit(vault, "TradingBotUpdated");
      expect(await vault.tradingBot()).to.equal(tradingBot.address);
    });

    it("Should revert if non-owner tries to set trading bot", async function () {
      await expect(
        vault.connect(attacker).setTradingBot(attacker.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Vesting", function () {
    it("Should allow owner to set vesting and user to claim after delay", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const delay = 60;

      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("5.0"),
      });

      await vault.setVesting(user.address, depositAmount, delay);

      const vestingInfo = await vault.userVestings(user.address);
      expect(vestingInfo.amount).to.equal(depositAmount);

      await expect(vault.connect(user).claimVesting())
        .to.be.revertedWith("Not released yet");

      await time.increase(70);

      await expect(vault.connect(user).claimVesting())
        .to.changeEtherBalance(user, depositAmount);
    });

    it("Should revert claim if no vesting exists", async function () {
      await expect(vault.connect(user).claimVesting())
        .to.be.revertedWith("No vesting found");
    });
  });

  describe("Execute Trade (AI Bot)", function () {
    beforeEach(async function () {
      await vault.setTradingBot(tradingBot.address);
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("2.0"),
      });
    });

    it("Should allow authorized trading bot to execute trades", async function () {
      const target = user.address;
      const value = ethers.parseEther("0.5");
      const data = "0x";

      await expect(
        vault.connect(tradingBot).executeTrade(target, data, value, { value: 0 })
      )
        .to.emit(vault, "TradeExecuted")
        .withArgs(target, value);
    });

    it("Should revert if non-bot tries to execute trade", async function () {
      await expect(
        vault.connect(attacker).executeTrade(user.address, "0x", 0)
      ).to.be.revertedWith("Only AI Bot authorized");
    });
  });

  describe("Process Payment", function () {
    it("Should allow owner to process payment", async function () {
      // شارژ قرارداد
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("3.0"),
      });

      const amount = ethers.parseEther("1.0");

      // چک کردن ایونت
      await expect(vault.processPayment(user.address, amount))
        .to.emit(vault, "PaymentProcessed")
        .withArgs(user.address, amount);

      // شارژ دوباره برای تست تغییر موجودی
      await owner.sendTransaction({
        to: await vault.getAddress(),
        value: ethers.parseEther("1.5"),
      });

      // چک کردن تغییر موجودی (جداگانه)
      await expect(vault.processPayment(user.address, amount))
        .to.changeEtherBalance(user, amount);
    });

    it("Should revert if non-owner tries to process payment", async function () {
      await expect(
        vault.connect(attacker).processPayment(attacker.address, 100)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("UUPS Upgrade", function () {
    it("Should allow owner to upgrade the contract", async function () {
      const VaultFactoryV2 = await ethers.getContractFactory("GIWAOmniStrategicVault");
      const upgradedVault = await upgrades.upgradeProxy(
        await vault.getAddress(),
        VaultFactoryV2
      );

      expect(await upgradedVault.owner()).to.equal(owner.address);
    });
  });
});
