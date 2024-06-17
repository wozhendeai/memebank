import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS } from "./utils/Constants";
import { createNewAccountAndGetContract } from "./utils/createNewAccountAndGetContract";
import { DeployAccountFactoryFixtureReturnType, deployAccountFactoryFixture } from "./utils/deployAccountFactoryFixture";
import { expect } from "chai";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AccountFactory Tests", function () {
    it("should have the correct params", async function () {
        const { accountFactory, engine } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;

        // Retrieve addresses from the contract
        const storedPerpsMarketProxyAddress = await accountFactory.perpsMarketProxy();
        const storedEngineAddress = await accountFactory.engine();
        const storedSUSDAddress = await accountFactory.sUSD();
        const storedUSDCAddress = await accountFactory.USDC();

        expect(storedPerpsMarketProxyAddress).to.equal(PERPS_MARKET_PROXY_ADDRESS);
        expect(storedEngineAddress).to.equal(ENGINE_ADDRESS);
        expect(storedSUSDAddress).to.equal(SUSD_ADDRESS);
        expect(storedUSDCAddress).to.equal(USDC_ADDRESS);

    });

    it("should emit an AccountCreated event with the new account address and creator address", async function () {
        const { accountFactory, actor } = await loadFixture(deployAccountFactoryFixture);
        const tx = accountFactory.connect(actor).createAccount();

        await expect(tx)
            .to.emit(accountFactory, "AccountCreated")
            .withArgs(anyValue, actor.address);
    });

    it("should make user the owner of the new account contract", async function () {
        const { accountFactory, actor, actorAddress } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
        const tx = await accountFactory.connect(actor).createAccount(); // Make sure to await the promise here
        const [newAccountContract,] = await createNewAccountAndGetContract(tx); // Correctly use await

        // Assuming there's a way to retrieve the owner from the Account contract
        expect(await newAccountContract.owner()).to.equal(actorAddress);
    });

    // TODO: test getAccounts
    it("should return the correct list of accounts for a user", async function () {
        const { accountFactory, actor, actorAddress } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;

        // Create multiple accounts for the user
        const tx1 = await accountFactory.connect(actor).createAccount();
        const [,account1Address] = await createNewAccountAndGetContract(tx1);

        const tx2 = await accountFactory.connect(actor).createAccount();
        const [,account2Address] = await createNewAccountAndGetContract(tx2);

        const tx3 = await accountFactory.connect(actor).createAccount();
        const [,account3Address] = await createNewAccountAndGetContract(tx3);

        // Call getAccountsByUser and check the returned list of accounts
        const userAccounts = await accountFactory.getAccountsByUser(actorAddress);

        expect(userAccounts).to.have.lengthOf(3);
        expect(userAccounts).to.include(account1Address);
        expect(userAccounts).to.include(account2Address);
        expect(userAccounts).to.include(account3Address);
    });
});
