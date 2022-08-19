const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter Contract", () => {
  let deploy;
  describe("Deploying", () => {
    beforeEach(async () => {
      const Counter = await ethers.getContractFactory("Counter");
      deploy = await Counter.deploy("My Counter", 1);
    });

    it("Initializes the count", async () => {
      const count = await deploy.counter();
      expect(count).to.equal(1);
    });

    it("Initializes the name", async () => {
      const name = await deploy.name();
      expect(name).to.equal("My Counter");
    });
  });

  describe("Counting", () => {
    let transaction;
    it("Increments the counter", async () => {
      transaction = await deploy.increment();
      await transaction.wait();
      expect(await deploy.counter()).to.equal(2);

      transaction = await deploy.increment();
      await transaction.wait();
      expect(await deploy.counter()).to.equal(3);
    });

    it("Decrements the counter", async () => {
      transaction = await deploy.decrement();
      await transaction.wait();
      expect(await deploy.counter()).to.equal(2);
    });
  });
});
