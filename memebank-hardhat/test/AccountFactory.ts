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
        const tx = accountFactory.connect(actor).createAccount(0);

        await expect(tx)
            .to.emit(accountFactory, "AccountCreated")
            .withArgs(anyValue, actor.address);
    });

    it("should make user the owner of the new account contract", async function () {
        const { accountFactory, actor, actorAddress } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
        const tx = await accountFactory.connect(actor).createAccount(0);
        const [newAccountContract,] = await createNewAccountAndGetContract(tx);

        expect(await newAccountContract.owner()).to.equal(actorAddress);
    });

    // TODO: test getAccounts
    it("should return the correct list of accounts for a user with detailed information", async function () {
        const { accountFactory, actor, actorAddress } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
    
        // Create multiple accounts for the user with different strategies
        const tx1 = await accountFactory.connect(actor).createAccount(0);
        const [,account1Address] = await createNewAccountAndGetContract(tx1);
    
        const tx2 = await accountFactory.connect(actor).createAccount(1);
        const [,account2Address] = await createNewAccountAndGetContract(tx2);
    
        const tx3 = await accountFactory.connect(actor).createAccount(2);
        const [,account3Address] = await createNewAccountAndGetContract(tx3);
    
        // Call getAccountsByUser and check the returned list of AccountData structs
        const accountsData = await accountFactory.getAccountsByUser(actorAddress);
    
        expect(accountsData).to.have.lengthOf(3);
    
        // Validate the data in the returned AccountData structs
        // Check addresses
        expect(accountsData.map(account => account.accountAddress)).to.deep.include.members([account1Address, account2Address, account3Address]);
        // Check account IDs, total balances, and strategy types (assuming you can access these details)
        accountsData.forEach(accountData => {
            expect(accountData.accountId).to.be.a('bigint');
            expect(accountData.totalBalance).to.be.a('bigint');
            expect(Number(accountData.strategyType)).to.be.oneOf([0, 1, 2]); // Corresponding to the enum StrategyType
        });
    });
    
    it("should correctly predict the new account address", async function () {
        const { accountFactory, actor, actorAddress } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
        const STRATEGY_TYPE = 0;

        // Predict the new account address
        const predictedAddress = await accountFactory.determineNewAccountAddress(actorAddress, STRATEGY_TYPE);
        // Create the new account
        const tx = await accountFactory.connect(actor).createAccount(STRATEGY_TYPE);
        const [newAccountContract, newAccountAddress] = await createNewAccountAndGetContract(tx);
    
        // Check if the predicted address matches the actual new account address
        expect(predictedAddress).to.equal(newAccountAddress);
    });
    
});
