import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS, SNX_ADDRESS } from "../../test/utils/Constants";
import deployed_addresses from '../deployments/chain-8453/deployed_addresses.json';

export default buildModule("DeployAccount", (m) => {
    const LATEST_ACCOUNT_FACTORY_ADDRESS = deployed_addresses['DeployAccountFactory#AccountFactory'] as `0x${string}`;

    const accountFactory = m.contract("Account", [
        PERPS_MARKET_PROXY_ADDRESS,
        ENGINE_ADDRESS,
        SUSD_ADDRESS,
        USDC_ADDRESS,
        SNX_ADDRESS,
        LATEST_ACCOUNT_FACTORY_ADDRESS,
        0
    ]);

    return { accountFactory };
});