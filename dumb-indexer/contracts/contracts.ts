// contracts.ts
import { ABI as AccountFactoryABI } from './AccountFactoryABI';
import { ABI as AccountABI } from './AccountABI';
import { ABI as PerpsMarketProxyABI } from "./PerpsMarketProxyABI";


export const contracts = {
  AccountFactory: {
    address: "0x631658F09a33251A9fA6344223D4673176f5D1A1" as `0x${string}`,
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