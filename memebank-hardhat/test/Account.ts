import { expect } from "chai";
import { ethers } from "hardhat";
const {
  loadFixture,
  impersonateAccount,
  stopImpersonatingAccount,
  setBalance
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
import { ENGINE_ADDRESS, COLLATERAL_ADDRESS, COLLATERAL_DECIMALS, SUSD_ADDRESS, USDC_ADDRESS } from "./utils/Constants";
import { DeployAccountFactoryFixtureReturnType, deployAccountFactoryFixture } from "./utils/deployAccountFactoryFixture";
import { createNewAccountAndGetContract } from "./utils/createNewAccountAndGetContract";
import { stealToken } from "./utils/stealToken";

const depositAmount = ethers.parseUnits("1", COLLATERAL_DECIMALS); // 1000 USDC


describe("Account Tests", function () {

  it("should have granted kwentas engine admin permission", async function () {
    const { accountFactory, actor, perpsMarketProxy } = await loadFixture(deployAccountFactoryFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
    const [newAccount,] = await createNewAccountAndGetContract(createAccountTransaction);
    const accountId = await newAccount.accountId();

    // Fetch permissions from the perpsMarketProxy
    const permissions = await perpsMarketProxy.getAccountPermissions(accountId);

    // Get 'ADMIN' permission hash
    const expectedPermissionHash = ethers.encodeBytes32String("ADMIN");

    // Check if the permissions array contains the expected permission for the Kwenta engine
    let hasPermission = permissions.some((perm: { user: string; permissions: string | string[]; }) => {
      return perm.user.toLowerCase() === ENGINE_ADDRESS.toLowerCase() &&
        perm.permissions.includes(expectedPermissionHash);
    });

    // Assert that the necessary permission is present
    expect(hasPermission, "Engine should have the required permissions for the account").to.be.true;
  });

  // On testnet, we use snxUSD to make deposits into the account
  // On mainnet, we zap using USDC
  it("should handle collateral deposits correctly", async function () {
    const { accountFactory, perpsMarketProxy, actor, actorAddress, collateral } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
    const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
    const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

    // Transfer needed collateral to actor
    await stealToken(collateral, actor, depositAmount);

    // The user has to approve the `Account` contract to transfer their collat.
    await collateral.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
    expect(await collateral.allowance(actorAddress, newAccountAddress)).to.equal(ethers.MaxUint256);

    // Ensure event is emitted

    // TODO: Test `modifyCollateral` on mainnet and `modifyCollateralZap` on testnet
    if (COLLATERAL_ADDRESS == SUSD_ADDRESS) {
      // If we're on testnet, we use `modifyCollateral` and deposit `snxUSD`
      await expect(newAccount.connect(actor).modifyCollateral(depositAmount, 0))
        .to.emit(newAccount, "CollateralDeposited")
        .withArgs(COLLATERAL_ADDRESS, depositAmount);
    } else if (COLLATERAL_ADDRESS == USDC_ADDRESS) {
      // If we're on mainnet, we can use `modifyCollateralZap` and deposit USDC directly
      await expect(newAccount.connect(actor).modifyCollateralZap(depositAmount))
        .to.emit(newAccount, "CollateralDeposited")
        .withArgs(COLLATERAL_ADDRESS, depositAmount, 0);
    }

    // Ensure user has collateral
    const accountId = await newAccount.accountId();
    const availableMargin = await perpsMarketProxy.getAvailableMargin(accountId);

    // Convert depositAmount to a standardized 18 decimal format for comparison
    const standardizedDepositAmount = ethers.parseUnits(
      ethers.formatUnits(depositAmount, COLLATERAL_DECIMALS),
      18
    );

    expect(availableMargin).to.be.equal(standardizedDepositAmount);
  });

  it("should handle collateral withdrawals correctly", async function () {
    const { accountFactory, actor, perpsMarketProxy, collateral, COLLATERAL_ADDRESS } = await loadFixture(deployAccountFactoryFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
    const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction);
    const accountId = await newAccount.accountId();
  
    // Assume COLLATERAL_ADDRESS and depositAmount are defined as per the deposit test
    // Transfer needed collateral to actor for depositing
    await stealToken(collateral, actor, depositAmount); // depositing twice the amount to test withdrawal later
  
    // Approve the account to use the collateral
    await collateral.connect(actor).approve(newAccountAddress, depositAmount);
    await newAccount.connect(actor).modifyCollateralZap(depositAmount);
  
    // Deposit is successful, now try to withdraw
    const withdrawAmount = depositAmount; // withdraw half the deposited amount
    await expect(newAccount.connect(actor).modifyCollateralZap(-withdrawAmount))
      .to.emit(newAccount, "CollateralWithdrawn")
      .withArgs(COLLATERAL_ADDRESS, withdrawAmount, 0);
  
    // Check the final collateral balance in the account
    const finalCollateralBalance = await perpsMarketProxy.getAvailableMargin(accountId);
    expect(finalCollateralBalance).to.equal(0);
  
    // Verify the withdrawal does not allow the account to withdraw more than deposited
    await expect(newAccount.connect(actor).modifyCollateral(depositAmount, accountId))
      .to.be.revertedWith("InsufficientCollateral");
  });
  
  it("should execute a trade and emit the OrderCommitted event", async function () {
    const { accountFactory, actor, actorAddress, collateral } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
    const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
    const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

    // Transfer needed collateral to actor
    await stealToken(collateral, actor, depositAmount);

    // The user has to approve the `Account` contract to transfer their collateral
    await collateral.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
    expect(await collateral.allowance(actorAddress, newAccountAddress)).to.equal(ethers.MaxUint256);

    // Deposit funds
    COLLATERAL_ADDRESS == SUSD_ADDRESS ? await newAccount.connect(actor).modifyCollateral(depositAmount, 0) : newAccount.connect(actor).modifyCollateralZap(depositAmount);

    // Trade data
    const perpsMarketId = 1200;
    const sizeDelta = 100;
    const settlementStrategyId = 1; // 1 = BUY 2 = SELL
    const acceptablePrice = ethers.MaxUint256;
    const trackingCode = ethers.encodeBytes32String("TRACKING_CODE");
    const accountId = await newAccount.accountId();

    await expect(newAccount.connect(actor).executeTrade(perpsMarketId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode))
      .to.emit(newAccount, "OrderCommitted")
      .withArgs(
        [
          anyValue, // settlementTime
          [
            perpsMarketId,
            accountId,
            sizeDelta,
            settlementStrategyId,
            acceptablePrice,
            trackingCode,
            anyValue, // referrer TODO: owner of factory contract
          ],
        ],
        perpsMarketId,
        accountId,
        sizeDelta,
        settlementStrategyId,
        acceptablePrice,
        trackingCode,
        anyValue // fees
      );
  });
});
