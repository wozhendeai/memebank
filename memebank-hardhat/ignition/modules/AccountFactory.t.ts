import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Synthetix Proxy Router
const PERPS_MARKET_PROXY_ADDRESS = "0x0A2AF931eFFd34b81ebcc57E3d3c9B1E1dE1C9Ce";
// Kwenta Smart Engine v3
const ENGINE_ADDRESS = "0xe331a7eeC851Ba702aA8BF43070a178451d6D28E";
// Token contracts & info
const SNXUSD_ADDRESS = "0x682f0d17feDC62b2a0B91f8992243Bf44cAfeaaE"; // On testnet we actually use snxUSD https://docs.synthetix.io/v/v3/for-developers/deployment-info/84532-andromeda#collateral-snxusd-synthetic-usd-token-v3
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // deprecated for deposits/zaps on testnet

export default buildModule("DeployAccountFactory", (m) => {

    const accountFactory = m.contract("AccountFactory", [
        PERPS_MARKET_PROXY_ADDRESS,
        ENGINE_ADDRESS,
        SNXUSD_ADDRESS,
        USDC_ADDRESS,
    ]);


    return { accountFactory };
});