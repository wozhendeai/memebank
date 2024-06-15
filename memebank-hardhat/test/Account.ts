import { expect } from "chai";
import { ethers } from "hardhat";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  loadFixture,
  impersonateAccount,
  stopImpersonatingAccount
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
import { Contract, ContractTransactionResponse, EventLog, Signer, TransactionReceipt } from "ethers";
import {
  AccountFactory,
  AccountFactory__factory,
  Account,
  Account__factory,
  IERC20__factory,
  IPerpsMarketProxy,
  IPerpsMarketProxy__factory,
  IEngine,
  IEngine__factory,
} from "../typechain-types";
import { AccountCreatedEvent } from "../typechain-types/contracts/AccountFactory";
import { IERC20, IERC20Interface } from "../typechain-types/@openzeppelin/contracts/token/ERC20/IERC20";

let perpsMarketProxy: IPerpsMarketProxy;
let engine: IEngine;
let sUSD: IERC20;
let USDC: IERC20;
let accountFactory: AccountFactory;
let account: Account;
let accountId: number;
let owner: Signer;
let actor: Signer;

const BASE_BLOCK_NUMBER = 8100100;
const PERPS_MARKET_PROXY_ADDRESS = "0xf53Ca60F031FAf0E347D44FbaA4870da68250c8d";
const ENGINE_ADDRESS = "0xe5bB889B1f0B6B4B7384Bd19cbb37adBDDa941a6";
const SUSD_ADDRESS = "0x8069c44244e72443722cfb22DcE5492cba239d39";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDC_WHALE = "0x3239a95a9262034ca28b9a03133775f716f119f8";
const ACTOR_ADDRESS = "0xFd8d0A63F88C9B45E0790D101496c44FaDeDc899";
const SIZE_DELTA = ethers.parseEther("0.01");
const ACCEPTABLE_PRICE_LONG = ethers.MaxUint256;
const TRACKING_CODE = ethers.encodeBytes32String("KWENTA");
const SETTLEMENT_STRATEGY_ID = 0;
const SETH_PERPS_MARKET_ID = 200;
const AMOUNT = ethers.parseEther("10000");
const INVALID_PERPS_MARKET_ID = ethers.MaxUint256;

async function deployContractsFixture() {
  const [owner, actor] = await ethers.getSigners();

  const accountFactory = await (await ethers.getContractFactory("AccountFactory")).deploy(
    PERPS_MARKET_PROXY_ADDRESS,
    ENGINE_ADDRESS,
    SUSD_ADDRESS,
    USDC_ADDRESS
  );
  await accountFactory.waitForDeployment();

  const perpsMarketProxy = await ethers.getContractAt("IPerpsMarketProxy", PERPS_MARKET_PROXY_ADDRESS);
  const engine = await ethers.getContractAt("IEngine", ENGINE_ADDRESS);
  const sUSD = await ethers.getContractAt("IERC20", SUSD_ADDRESS);
  const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);

  // Get a signer for the impersonated account
  await impersonateAccount(USDC_WHALE);
  const whaleSigner = await ethers.getSigner(USDC_WHALE);

  // Attach the whale signer to the USDC contract
  const usdcWhale = sUSD.connect(whaleSigner);

  // Ensure the whale has enough USDC to transfer
  const amountToTransfer = ethers.parseUnits("1000", 6); // 10 million USDC
  const transferTx = await usdcWhale.transfer(actor.address, amountToTransfer);
  await transferTx.wait();
  await stopImpersonatingAccount(USDC_WHALE);
  // TODO: Expect user to have positive usdc balance
  
  return { accountFactory, perpsMarketProxy, engine, sUSD, USDC, owner, actor };
}

async function createNewAccountAndGetContract(tx: ContractTransactionResponse): Promise<[Account, string]> {
  const receipt: TransactionReceipt | null = await tx.wait();

  // Get the newly created contract address
  const accountCreatedLog = receipt?.logs.find(log =>
    log instanceof EventLog && log.fragment.name === "AccountCreated"
  ) as EventLog;
  const newAccountAddress = accountCreatedLog.args[0] as string;

  // Get instance of new contract
  const account = await ethers.getContractAt("Account", newAccountAddress) as Account;

  return [account, newAccountAddress];
}

// TODO: AccountFactory tests

describe("Account Tests", function () {
  it("should emit an AccountCreated event with the new account address and creator address", async function () {
    const { accountFactory, actor } = await loadFixture(deployContractsFixture);
    const tx = accountFactory.connect(actor).createAccount();

    await expect(tx)
      .to.emit(accountFactory, "AccountCreated")
      .withArgs(anyValue, actor.address);
  });

  it("should have granted kwentas engine admin permission", async function() {
    const { accountFactory, actor, perpsMarketProxy } = await loadFixture(deployContractsFixture);
    const createAccountTransaction = await accountFactory.connect(actor).createAccount();
    const [newAccount, ] = await createNewAccountAndGetContract(createAccountTransaction);
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
    console.log(hasPermission)
    // Assert that the necessary permission is present
    expect(hasPermission, "Engine should have the required permissions for the account").to.be.true;
  });

  it("should make user the owner of the new account contract", async function () {
    const { accountFactory, actor } = await loadFixture(deployContractsFixture);
    const tx = await accountFactory.connect(actor).createAccount(); // Make sure to await the promise here
    const [newAccountContract,] = await createNewAccountAndGetContract(tx); // Correctly use await

    // Assuming there's a way to retrieve the owner from the Account contract
    expect(await newAccountContract.owner()).to.equal(actor.address);
  });

  describe("Account Operation Tests", function () {
    // TODO: Make a fixture to create accounts, or beforeEach
    it("should handle collateral deposits correctly", async function () {
      const { accountFactory, USDC, actor, sUSD} = await loadFixture(deployContractsFixture);
      const createAccountTransaction = await accountFactory.connect(actor).createAccount();
      const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

      // Max approve `Account` contract for spending
      const depositAmount = ethers.parseUnits("100", 18); // CHANGE DECIMALS
      await sUSD.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
      await sUSD.connect(actor).approve(ENGINE_ADDRESS, ethers.MaxUint256);

      // Check allowance before deposit
      const allowanceBefore = await sUSD.allowance(actor.address, newAccountAddress);
      expect(allowanceBefore).to.equal(ethers.MaxUint256);

      // Deposit
      await expect(newAccount.connect(actor).depositCollateral(depositAmount))
        .to.emit(newAccount, "CollateralDeposited")
        .withArgs(USDC_ADDRESS, depositAmount);
    });

    // it("should execute a trade and emit the OrderCommitted event", async function () {
    //   const { accountFactory, actor } = await loadFixture(deployContractsFixture);
    //   const newAccountAddress = await accountFactory.connect(actor).createAccount();
    //   const account = await ethers.getContractAt("Account", newAccountAddress);

    //   const perpsMarketId = 1; // Example market ID
    //   const sizeDelta = 100; // Example size delta for the trade
    //   const settlementStrategyId = 1; // Example settlement strategy
    //   const acceptablePrice = ethers.MaxUint256; // Example price
    //   const trackingCode = ethers.encodeBytes32String("TRACKING_CODE"); // Example tracking code
    //   const referrer = actor.address; // Example referrer address

    //   await expect(account.connect(actor).executeTrade(perpsMarketId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode, referrer))
    //     .to.emit(account, "OrderCommitted")
    //     .withArgs(ethers.ZeroAddress, perpsMarketId, account.accountId, sizeDelta, settlementStrategyId, acceptablePrice, trackingCode, referrer, 0);  // Placeholder for the actual emitted values
    // });
  });
});
