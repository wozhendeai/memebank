// contracts.ts
import { ABI as AccountFactoryABI } from './AccountFactoryABI';
import { ABI as AccountABI } from './AccountABI';
import deployed_addresses from '../../../memebank-hardhat/ignition/deployments/chain-8453/deployed_addresses.json';


export const contracts = {
  AccountFactory: {
    address: deployed_addresses['DeployAccountFactory#AccountFactory'] as `0x${string}`,
    abi: AccountFactoryABI.abi,
  },
  Account: {
    abi: AccountABI.abi,
  },
};