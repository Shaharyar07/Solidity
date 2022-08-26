const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", () => {
  let deployer, attackerContract;
  let bank;

  beforeEach(async () => {
    [deployer, user, attacker] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Bank", deployer);

    bank = await Bank.deploy();

    const Attacker = await ethers.getContractFactory("Attacker", attacker);

    attackerContract = await Attacker.deploy(bank.address);

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

    it("allows attacker to drain funds from withdraw", async () => {
      console.log("-------Before-------");
      console.log(
        "Bank's Balance: ",
        ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))
      );
      console.log(
        "Attacker's Balance: ",
        ethers.utils.formatEther(
          await ethers.provider.getBalance(attacker.address)
        )
      );

      // Attacker withdraws funds from bank
      await attackerContract.attack({ value: ethers.utils.parseEther("10") });

      console.log("-------After-------");
      console.log(
        "Bank's Balance: ",
        ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))
      );
      console.log(
        "Attacker's Balance: ",
        ethers.utils.formatEther(
          await ethers.provider.getBalance(attacker.address)
        )
      );
      

      //Check the balance has been drained
      expect(await ethers.provider.getBalance(bank.address)).to.equal(0);
    });
  });
});
