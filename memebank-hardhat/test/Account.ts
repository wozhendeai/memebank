import { expect } from "chai";
import { ethers } from "hardhat";
const {
  loadFixture,
  impersonateAccount,
  stopImpersonatingAccount,
  setBalance
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
import { ContractTransactionResponse, EventLog, TransactionReceipt } from "ethers";
import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, USDC_WHALE } from "./utils/Constants";
import { DeployAccountFactoryFixtureReturnType, deployAccountFactoryFixture } from "./utils/deployAccountFactoryFixture";
import { createNewAccountAndGetContract } from "./utils/createNewAccountAndGetContract";

const SIZE_DELTA = ethers.parseEther("0.01");
const ACCEPTABLE_PRICE_LONG = ethers.MaxUint256;
const TRACKING_CODE = ethers.encodeBytes32String("KWENTA");
const SETTLEMENT_STRATEGY_ID = 0;
const SETH_PERPS_MARKET_ID = 200;
const AMOUNT = ethers.parseEther("10000");
const INVALID_PERPS_MARKET_ID = ethers.MaxUint256;


describe("Account Tests", function () {

  it("should have granted kwentas engine admin permission", async function () {
    const { accountFactory, actor, perpsMarketProxy } = await loadFixture(deployAccountFactoryFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount();
    const [newAccount,] = await createNewAccountAndGetContract(createAccountTransaction);
    const accountId = await newAccount.accountId();

    // Fetch permissions from the perpsMarketProxy
    const permissions = await perpsMarketProxy.getAccountPermissions(accountId);

    // Get 'ADMIN' permission hash
    const expectedPermissionHash = ethers.encodeBytes32String("ADMIN");

    // Check if the permissions array contains the expected permission for the Kwenta engine
    let hasPermission = permissions.some(perm => {
      return perm.user.toLowerCase() === ENGINE_ADDRESS.toLowerCase() &&
        perm.permissions.includes(expectedPermissionHash);
    });

    // Assert that the necessary permission is present
    expect(hasPermission, "Engine should have the required permissions for the account").to.be.true;
  });


  it("should handle usdc collateral deposits correctly", async function () {
    const { accountFactory, USDC, actor, perpsMarketProxy } = await loadFixture(deployAccountFactoryFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount();
    const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

    // Transfer sUSD to Actor
    await setBalance(USDC_WHALE, 100n ** 18n);
    await impersonateAccount(USDC_WHALE);
    const whaleSigner = await ethers.getSigner(USDC_WHALE);

    const depositAmount = ethers.parseUnits("1000", USDC_DECIMALS); // 1000 USDC
    const transferTx = await USDC.connect(whaleSigner).transfer(actor.address, depositAmount);

    await transferTx.wait();
    await stopImpersonatingAccount(USDC_WHALE);

    // The user has to approve the `Account` contract to transfer their collat.
    await USDC.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
    expect(await USDC.allowance(actor.address, newAccountAddress)).to.equal(ethers.MaxUint256);

    // Ensure user has enough USDC
    expect(await USDC.balanceOf(actor.address)).to.be.greaterThanOrEqual(depositAmount);

    // Ensure event is emitted
    await expect(newAccount.connect(actor).modifyCollateralZap(depositAmount))
      .to.emit(newAccount, "CollateralDeposited")
      .withArgs(USDC_ADDRESS, depositAmount);

    const accountId = await newAccount.accountId();
    const availableMargin = await perpsMarketProxy.getAvailableMargin(accountId);
    expect(availableMargin).to.be.greaterThan(0);
  });


  it("should execute a trade and emit the OrderCommitted event", async function () {
    const { accountFactory, actor, USDC, perpsMarketProxy } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
    const createAccountTransaction = await accountFactory.connect(actor).createAccount();
    const [account, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

    // Deposit margin
    // TODO: Please fucking clean this up
    const depositAmount = ethers.parseUnits("100000", USDC_DECIMALS);
    const actorAddress = await actor.getAddress();
    await setBalance(USDC_WHALE, 100n ** 18n);
    await impersonateAccount(USDC_WHALE);
    const whaleSigner = await ethers.getSigner(USDC_WHALE);
    const transferTx = await USDC.connect(whaleSigner).transfer(actorAddress, depositAmount);
    await transferTx.wait();
    await stopImpersonatingAccount(USDC_WHALE);
    await USDC.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
    await account.connect(actor).modifyCollateralZap(depositAmount);

    const perpsMarketId = 1200; // Example market ID
    const sizeDelta = 100; // Example size delta for the trade
    const settlementStrategyId = 0; // Example settlement strategy
    const acceptablePrice = ethers.MaxUint256; // Example price
    const trackingCode = ethers.encodeBytes32String("TRACKING_CODE"); // Example tracking code
    const accountId = await account.accountId();

    await expect(account.connect(actor).executeTrade(perpsMarketId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode))
      .to.emit(account, "OrderCommitted")
      .withArgs(ethers.ZeroAddress, perpsMarketId, accountId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode, 0);  // Placeholder for the actual emitted values
  });
});
