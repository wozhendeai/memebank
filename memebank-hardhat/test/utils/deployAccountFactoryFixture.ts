import { ethers } from "hardhat";
import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS, COLLATERAL_ADDRESS, SNX_ADDRESS } from "./Constants";
import { AccountFactory, IPerpsMarketProxy, IEngine, IERC20 } from "../../typechain-types";
import { Signer } from "ethers";

export type DeployAccountFactoryFixtureReturnType = {
  accountFactory: AccountFactory;
  perpsMarketProxy: IPerpsMarketProxy;
  engine: IEngine;
  sUSD: IERC20;
  USDC: IERC20;
  snxUSD: IERC20;
  collateral: IERC20;
  owner: Signer;
  actor: Signer;
  actorAddress: string;
};

export async function deployAccountFactoryFixture(): Promise<DeployAccountFactoryFixtureReturnType> {
  const [owner, actor] = await ethers.getSigners();

  const accountFactory = await (await ethers.getContractFactory("AccountFactory")).deploy(
    PERPS_MARKET_PROXY_ADDRESS,
    ENGINE_ADDRESS,
    SUSD_ADDRESS,
    USDC_ADDRESS,
    SNX_ADDRESS
  );
  await accountFactory.waitForDeployment();

  const perpsMarketProxy = await ethers.getContractAt("IPerpsMarketProxy", PERPS_MARKET_PROXY_ADDRESS);
  const engine = await ethers.getContractAt("IEngine", ENGINE_ADDRESS);
  const sUSD = await ethers.getContractAt("IERC20", SUSD_ADDRESS);
  const USDC = await ethers.getContractAt("IERC20", USDC_ADDRESS);
  const collateral = await ethers.getContractAt("IERC20", COLLATERAL_ADDRESS);
  const actorAddress = await actor.getAddress();
  const snxUSD = await ethers.getContractAt("IERC20", SNX_ADDRESS);

  return { accountFactory, perpsMarketProxy, engine, sUSD, USDC, snxUSD, collateral, owner, actor, actorAddress };
}