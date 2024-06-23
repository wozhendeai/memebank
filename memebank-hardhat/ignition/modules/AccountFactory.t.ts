import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { PERPS_MARKET_PROXY_ADDRESS, ENGINE_ADDRESS, SUSD_ADDRESS, USDC_ADDRESS, SNX_ADDRESS } from "../../test/utils/Constants";

export default buildModule("DeployAccountFactory", (m) => {

    const accountFactory = m.contract("AccountFactory", [
        PERPS_MARKET_PROXY_ADDRESS,
        ENGINE_ADDRESS,
        SUSD_ADDRESS,
        USDC_ADDRESS,
        SNX_ADDRESS
    ]);


    return { accountFactory };
});