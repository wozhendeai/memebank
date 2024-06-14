// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol"; // Import console for logging
import {Constants} from "./Constants.sol";
import {IEngine} from "../../src/external/IEngine.sol";
import {IPerpsMarketProxy} from "../../src/external/IPerpsMarketProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccountFactory} from "../../src/AccountFactory.sol";
import {Account as CustomAccount} from "../../src/Account.sol"; // Fully qualify the import

// @title Contract for bootstrapping AccountFactory and Account.
// @dev It creates an account as well to ACTOR
contract Bootstrap is Test, Constants {
    IPerpsMarketProxy public perpsMarketProxy;
    IEngine public engine;
    IERC20 public sUSD;
    IERC20 public USDC;
    AccountFactory public accountFactory;
    CustomAccount public account;
    uint128 public accountId;

    function initializeBase() public {
        string memory rpcUrl = vm.rpcUrl("base-sepolia");
        vm.createFork(rpcUrl, BASE_BLOCK_NUMBER);

        // Initialize contracts with constants
        perpsMarketProxy = IPerpsMarketProxy(PERPS_MARKET_PROXY_ADDRESS);
        engine = IEngine(ENGINE_ADDRESS);
        sUSD = IERC20(SUSD_ADDRESS);
        USDC = IERC20(USDC_ADDRESS);
        accountFactory = new AccountFactory(
            PERPS_MARKET_PROXY_ADDRESS,
            ENGINE_ADDRESS,
            SUSD_ADDRESS,
            USDC_ADDRESS
        );

        console.log("Contracts initialized, AccountFactory deployed at", address(accountFactory));
    }
}
