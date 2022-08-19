const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", () => {
  let deployer;
  let bank;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Bank", deployer);
    bank = await Bank.deploy();
    await bank.deposit({ value: ethers.utils.parseEther("1") });
  });

  describe("Facilitates the deposits and withdraws", () => {
    it("accepts the deposits", async () => {
      //Check deposit balance
      const deployerBalance = await bank.balanceOf(deployer.address);
      expect(deployerBalance.toString()).to.equal(ethers.utils.parseEther("1"));
    });
  });
});
