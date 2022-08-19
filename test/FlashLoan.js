const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("FlashLoan", () => {
  let token, flashLoan, flashLoanReceiver;
  let deployer;
  beforeEach(async () => {
    //Setup accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    // loads contracts
    const Token = await ethers.getContractFactory("Token");
    const FlashLoan = await ethers.getContractFactory("FlashLoan");
    const FlashLoanReceiver = await ethers.getContractFactory(
      "FlashLoanReceiver"
    );
    //Deploy Token
    token = await Token.deploy("FlashLoan Token", "FLT", 1000000);

    //Deploy FlashLoan Pool
    flashLoan = await FlashLoan.deploy(token.address);

    //Deploy FlashLoan Receiver
    flashLoanReceiver = await FlashLoanReceiver.deploy(flashLoan.address);

    // Approve token to flashLoan
    let transaction = await token
      .connect(deployer)
      .approve(flashLoan.address, tokens(1000000));
    await transaction.wait();

    transaction = await flashLoan
      .connect(deployer)
      .depositTokens(tokens(1000000));
    await transaction.wait();
  });
  describe("Deployment", () => {
    it("Sends token to flash loan pool", async () => {
      expect(await token.balanceOf(flashLoan.address)).to.equal(
        tokens(1000000)
      );
    });
  });

  describe("Borrowing Funds", () => {
    it("Borrows funds from the pool", async () => {
      let transaction = await flashLoanReceiver
        .connect(deployer)
        .executeFlashLoan(tokens(100));
      await transaction.wait();

      await expect(transaction)
        .to.emit(flashLoanReceiver, "LoanReceived")
        .withArgs(token.address, tokens(100));
    });
  });
});
