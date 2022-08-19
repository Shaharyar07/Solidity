const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate", () => {
  const nftID = 1;
  let realEstate, escrow;
  let seller, deployer;
  let transaction;
  beforeEach(async () => {
    //Setup accounts
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    //Load Contracts
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    //Deploy the contracts
    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      ethers.utils.parseUnits("100", "ether"),
      ethers.utils.parseUnits("20", "ether"),
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );
    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);
    await transaction.wait();
  });

  describe("Deployment", async () => {
    it("sends the nft to the seller/deployer", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    });
  });

  describe("Selling Real Estate", async () => {
    let balance, transaction;
    it("Executes a successful transaction", async () => {
      //Expect the nft seller to be the owner before sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      //Buyer deposits earnest
      transaction = await escrow
        .connect(buyer)
        .depositEarnest({ value: ethers.utils.parseUnits("20", "ether") });
      balance = await escrow.getBalance();
      console.log("Escrow Balance:", ethers.utils.formatEther(balance));

      //Inspector updates the status
      transaction = await escrow
        .connect(inspector)
        .updateInspectionStatus(true);
      await transaction.wait();
      console.log("Inspector updates the status");

      //Buyer approves the sale
      transaction = await escrow.connect(buyer).approveSale();
      await transaction.wait();
      console.log("Buyer approves the sale");

      //Seller approves the sale
      transaction = await escrow.connect(seller).approveSale();
      await transaction.wait();
      console.log("Seller approves the sale");

      //Lender funds the sale
      transaction = await lender.sendTransaction({
        to: escrow.address,
        value: ethers.utils.parseUnits("80", "ether"),
      });

      //Lender approves the sale
      transaction = await escrow.connect(lender).approveSale();
      await transaction.wait();
      console.log("Lender approves the sale");

      //finalize sale
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("Buyer finalizes the sale");

      //Expect the nft buyer to be the owner after sale
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);

      //Expect Seller to receive funds
      balance = await ethers.provider.getBalance(seller.address);
      console.log(
        "Seller balance after sale:",
        ethers.utils.formatEther(balance)
      );
      expect(balance).to.be.above(ethers.utils.parseUnits("10099", "ether"));
    });
  });
});
