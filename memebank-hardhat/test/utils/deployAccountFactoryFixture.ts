import { ethers } from "hardhat";
import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, USDC_WHALE } from "./Constants";
import { AccountFactory, IPerpsMarketProxy , IEngine, IERC20} from "../../typechain-types";
import { ContractTransaction, Signer } from "ethers";

export type DeployAccountFactoryFixtureReturnType = {
  accountFactory: AccountFactory;
  perpsMarketProxy: IPerpsMarketProxy;
  engine: IEngine;
  sUSD: IERC20;
  USDC: IERC20;
  owner: Signer;
  actor: Signer;
};

export async function deployAccountFactoryFixture(): Promise<DeployAccountFactoryFixtureReturnType> {
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
  
    return { accountFactory, perpsMarketProxy, engine, sUSD, USDC, owner, actor };
}
  