import { expect } from "chai";
import { ethers } from "hardhat";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  loadFixture,
  impersonateAccount,
  stopImpersonatingAccount,
  setBalance
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
import { Contract, ContractTransactionResponse, EventLog, Signer, TransactionReceipt } from "ethers";
import {
  AccountFactory,
  AccountFactory__factory,
  Account,
  Account__factory,
  IERC20__factory,
  IEngine,
  IEngine__factory,
} from "../typechain-types";
import { IPerpsMarketProxy } from "../typechain-types/contracts/external/IPerpsMarketProxy";
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
const SUSD_ADDRESS = "0x682f0d17feDC62b2a0B91f8992243Bf44cAfeaaE";
const USDC_ADDRESS = "0x69980C3296416820623b3e3b30703A74e2320bC8"; // deprecated
const USDC_WHALE = "";
const SUSD_WHALE = "0xA1AE612e07511A947783c629295678C07748bc7A";
const USDC_DECIMALS = 6;
const SUSD_DECIMALS = 18;
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

  // Transfer sUSD to Actor
  await setBalance(SUSD_WHALE, 100n ** 18n);
  await impersonateAccount(SUSD_WHALE);
  const whaleSigner = await ethers.getSigner(SUSD_WHALE);

  const amountToTransfer = ethers.parseUnits("1000", SUSD_DECIMALS); // 1000 USDC
  const transferTx = await sUSD.connect(whaleSigner).transfer(actor.address, amountToTransfer);

  await transferTx.wait();
  await stopImpersonatingAccount(SUSD_WHALE);

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

describe("AccountFactory Tests", function () {
  it("should have the correct params", async function () {
    const { accountFactory } = await loadFixture(deployContractsFixture);

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
});

describe("Account Tests", function () {
  it("should emit an AccountCreated event with the new account address and creator address", async function () {
    const { accountFactory, actor } = await loadFixture(deployContractsFixture);
    const tx = accountFactory.connect(actor).createAccount();

    await expect(tx)
      .to.emit(accountFactory, "AccountCreated")
      .withArgs(anyValue, actor.address);
  });

  it("should have granted kwentas engine admin permission", async function () {
    const { accountFactory, actor, perpsMarketProxy } = await loadFixture(deployContractsFixture);
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
      const { accountFactory, USDC, actor, sUSD } = await loadFixture(deployContractsFixture);
      const createAccountTransaction = await accountFactory.connect(actor).createAccount();
      const [newAccount, newAccountAddress] = await createNewAccountAndGetContract(createAccountTransaction); // Use await properly

      const depositAmount = ethers.parseUnits("1", SUSD_DECIMALS);

      // The user has to approve the `Account` contract to transfer their collat.
      await sUSD.connect(actor).approve(newAccountAddress, ethers.MaxUint256);
      expect(await sUSD.allowance(actor.address, newAccountAddress)).to.equal(ethers.MaxUint256);

      // The contract has to approve engine to transfer the users collat.
      expect(await sUSD.allowance(newAccountAddress, ENGINE_ADDRESS)).to.be.equal(ethers.MaxUint256);

      // Ensure user has enough USDC
      expect(await sUSD.balanceOf(actor.address)).to.be.greaterThanOrEqual(depositAmount);

      // Deposit
      await expect(newAccount.connect(actor).depositCollateral(depositAmount))
        .to.emit(newAccount, "CollateralDeposited")
        .withArgs(SUSD_ADDRESS, depositAmount);
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
