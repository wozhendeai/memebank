import { BigNumberish, Signer } from "ethers";
import { Account, IERC20 } from "../typechain-types";

const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  reset,
  impersonateAccount,
  stopImpersonatingAccount,
  setBalance
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {
  ENGINE_ADDRESS,
  COLLATERAL_ADDRESS,
  COLLATERAL_DECIMALS,
  SUSD_ADDRESS,
  USDC_ADDRESS
} = require("./utils/Constants");
const { deployAccountFactoryFixture } = require("./utils/deployAccountFactoryFixture");
const { createNewAccountAndGetContract } = require("./utils/createNewAccountAndGetContract");
const { stealToken } = require("./utils/stealToken");

describe("Account Tests", function () {
  const depositAmount = ethers.parseUnits("1", COLLATERAL_DECIMALS);
  const COLLATERAL_WHALE = "0x32C222A9A159782aFD7529c87FA34b96CA72C696";

  async function setupTestEnvironment() {
    const { accountFactory, actor, actorAddress, perpsMarketProxy, sUSD, collateral } = await loadFixture(deployAccountFactoryFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
    const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction);
    const accountId = await newAccount.accountId();

    return { accountFactory, actor, actorAddress, perpsMarketProxy, sUSD, collateral, newAccount, newAccountAddress, accountId };
  }

  async function depositCollateral(newAccount: Account, actor: Signer, collateral: IERC20, depositAmount: BigNumberish) {
    // Ensure user has enough collateral
    await stealToken(collateral, actor, depositAmount);
    // Approve Account contract to spend users collateral
    await collateral.connect(actor).approve(newAccount.getAddress(), depositAmount);
    // Deposit into Account
    await newAccount.connect(actor).modifyCollateralZap(depositAmount);
  }

  it("should handle collateral deposits correctly using `modifyCollateralZap`", async function () {
    const { newAccount, actor, actorAddress, perpsMarketProxy, collateral } = await setupTestEnvironment();
    const accountId = await newAccount.accountId();

    // Transfer needed collateral to actor for depositing
    await depositCollateral(newAccount, actor, collateral, depositAmount);

    const sUSDCMarketId = BigInt(0);
    const sUSDCCollateralAmount = await perpsMarketProxy.getCollateralAmount(accountId, sUSDCMarketId);
    const standardizedDepositAmount = ethers.parseUnits(ethers.formatUnits(depositAmount, COLLATERAL_DECIMALS), 18);

    expect(standardizedDepositAmount).to.be.equal(sUSDCCollateralAmount);
  });

  it("should handle collateral withdrawals correctly using `modifyCollateralZap`", async function () {
    const { newAccount, actor, actorAddress, perpsMarketProxy, collateral } = await setupTestEnvironment();
    const accountId = await newAccount.accountId();

    // Transfer needed collateral to actor for depositing
    await depositCollateral(newAccount, actor, collateral, depositAmount);

    // Ensure the user has sUSD as that's all modifyCollateralZap can convert
    const sUSDCMarketId = BigInt(0);
    const sUSDCCollateralAmount = await perpsMarketProxy.getCollateralAmount(accountId, sUSDCMarketId);
    // Synthetix represents in 18 decimals, but USDC is 6 TODO: make function `ensure18Decimals`
    const standardizedDepositAmount = ethers.parseUnits(
      ethers.formatUnits(depositAmount, COLLATERAL_DECIMALS),
      18
    );

    expect(standardizedDepositAmount).to.be.equal(sUSDCCollateralAmount);

    /**
     * Deposit is successful, now try to withdraw
     * - When depositing, we can use 6 decimals as engine is expecting USDC
     * - When withdrawing, modifyCollateral needs to get the collateral out of the account, 
     *   which is 18 decimals, so we must use 18 decimals when trying to withdraw.
     * - When we eventually transfer USDC back to the user, we can use 6 decimals there again.
     */
    const withdrawAmount = -standardizedDepositAmount;
    await expect(newAccount.connect(actor).modifyCollateralZap(withdrawAmount))
      .to.emit(newAccount, "CollateralWithdrawn")
      .withArgs(COLLATERAL_ADDRESS, withdrawAmount, 0);

    // Check the final collateral balance in the account
    const finalCollateralBalance = await perpsMarketProxy.getAvailableMargin(accountId);
    expect(finalCollateralBalance).to.equal(0);

  });

  // it("should execute a trade and emit the OrderCommitted event", async function () {
  //   const { accountFactory, actor, actorAddress, collateral } = await loadFixture(deployAccountFactoryFixture) as DeployAccountFactoryFixtureReturnType;
  //   const createAccountTransaction = await accountFactory.connect(actor).createAccount(0);
  //   const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

  //   // Transfer needed collateral to actor
  //   await stealToken(collateral, actor, depositAmount);

  //   // The user has to approve the `Account` contract to transfer their collateral
  //   await collateral.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
  //   expect(await collateral.allowance(actorAddress, newAccountAddress)).to.equal(ethers.MaxUint256);

  //   // Deposit funds
  //   COLLATERAL_ADDRESS == SUSD_ADDRESS ? await newAccount.connect(actor).modifyCollateral(depositAmount, 0) : newAccount.connect(actor).modifyCollateralZap(depositAmount);

  //   // Trade data
  //   const perpsMarketId = 1200;
  //   const sizeDelta = 100;
  //   // TODO: Look into settlement strategies, only 0 seems to be available
  //   const settlementStrategyId = 0; // 1 = BUY 2 = SELL
  //   const acceptablePrice = ethers.MaxUint256;
  //   const trackingCode = ethers.encodeBytes32String("TRACKING_CODE");
  //   const accountId = await newAccount.accountId();

  //   await expect(newAccount.connect(actor).executeTrade(perpsMarketId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode))
  //     .to.emit(newAccount, "OrderCommitted")
  //     .withArgs(
  //       [
  //         anyValue, // settlementTime
  //         [
  //           perpsMarketId,
  //           accountId,
  //           sizeDelta,
  //           settlementStrategyId,
  //           acceptablePrice,
  //           trackingCode,
  //           anyValue, // referrer TODO: owner of factory contract
  //         ],
  //       ],
  //       perpsMarketId,
  //       accountId,
  //       sizeDelta,
  //       settlementStrategyId,
  //       acceptablePrice,
  //       trackingCode,
  //       anyValue // fees
  //     );
  // });
});
