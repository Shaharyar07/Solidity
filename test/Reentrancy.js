const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", () => {
  let deployer;
  let bank;

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Bank", deployer);
    bank = await Bank.deploy();

    await bank.deposit({ value: ethers.utils.parseEther("1") });
    await bank.connect(user).deposit({ value: ethers.utils.parseEther("69") });
  });

  describe("Facilitates the deposits and withdraws", () => {
    it("accepts the deposits", async () => {
      //Check deposit balance
      const deployerBalance = await bank.balanceOf(deployer.address);
      expect(deployerBalance.toString()).to.equal(ethers.utils.parseEther("1"));

      const userBalance = await bank.balanceOf(user.address);
      expect(userBalance.toString()).to.equal(ethers.utils.parseEther("69"));
    });

    
    it("accepts the withdraws", async () => {
      await bank.withdraw();

      const deployerBalance = await bank.balanceOf(deployer.address);
      const userBalance = await bank.balanceOf(user.address);

      expect(userBalance.toString()).to.equal(ethers.utils.parseEther("69"));
      expect(deployerBalance.toString()).to.equal(ethers.utils.parseEther("0"));
    });
  });
});
