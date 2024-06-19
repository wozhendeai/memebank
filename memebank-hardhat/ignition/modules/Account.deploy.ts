import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Mainnet addresses TODO: import from mainnet?
export const PERPS_MARKET_PROXY_ADDRESS = "0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce";
export const ENGINE_ADDRESS = "0xe331a7eeC851Ba702aA8BF43070a178451d6D28E";
export const SUSD_ADDRESS = "0xC74eA762cF06c9151cE074E6a569a5945b6302E7";
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // deprecated
export const ACCOUNT_FACTORY = "0x3DdE158f22715e72a28ECEe668Df30198c72920c";

export default buildModule("DeployAccount", (m) => {

    const accountFactory = m.contract("Account", [
        PERPS_MARKET_PROXY_ADDRESS,
        ENGINE_ADDRESS,
        SUSD_ADDRESS,
        USDC_ADDRESS,
        ACCOUNT_FACTORY,
        0
    ]);


    return { accountFactory };
});