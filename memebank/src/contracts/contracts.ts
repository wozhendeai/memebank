// contracts.ts
import { ABI as AccountFactoryABI } from './AccountFactoryABI';
import { ABI as AccountABI } from './AccountABI';
import { ABI as PerpsMarketProxyABI } from "./PerpsMarketProxyABI";
import deployed_addresses from '../../../memebank-hardhat/ignition/deployments/chain-8453/deployed_addresses.json';


export const contracts = {
  AccountFactory: {
    address: deployed_addresses['DeployAccountFactory#AccountFactory'] as `0x${string}`,
    abi: AccountFactoryABI.abi,
  },
  Account: {
    abi: AccountABI.abi,
  },
  PerpsMarketProxy: {
    address: "0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce" as `0x${string}`,
    abi: PerpsMarketProxyABI
  }
};