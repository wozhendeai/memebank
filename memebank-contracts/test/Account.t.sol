// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol"; // Import console for logging
import {IPerpsMarketProxy} from "../src/external/IPerpsMarketProxy.sol";
import "./utils/Bootstrap.sol";
import "../src/AccountFactory.sol";
import {Account as CustomAccount} from "../src/Account.sol"; // Fully qualify the import
import "./utils/Constants.sol";

contract AccountTest is Bootstrap {
    function setUp() public {
        initializeBase();

        // Create a new account using the AccountFactory
        vm.startPrank(ACTOR);
        address newAccountAddress = accountFactory.createAccount();
        console.log("New account created");
        account = CustomAccount(newAccountAddress);
        accountId = account.accountId();

        console.log("Account created with ID:", accountId);
        vm.stopPrank();

    }
}

contract AsyncOrderTest is AccountTest {
    function test_depositCollateral() public {
        // Call the parent setup to initialize the fork and contracts
        super.setUp();
        vm.startPrank(ACTOR);

        console.log("Approving USDC for account");
        bool success = USDC.approve(address(account), type(uint256).max);
        require(success, "USDC approval failed");

        console.log("Depositing collateral");
        account.depositCollateral(int256(AMOUNT));

        vm.stopPrank();
    }
}

contract CommitOrder is AsyncOrderTest {
    function test_commitOrder() public {
        vm.prank(ACTOR);

        (IPerpsMarketProxy.Data memory retOrder, uint256 fees) = account
            .executeTrade({
                perpsMarketId: SETH_PERPS_MARKET_ID,
                sizeDelta: SIZE_DELTA,
                settlementStrategyId: SETTLEMENT_STRATEGY_ID,
                acceptablePrice: ACCEPTABLE_PRICE_LONG,
                trackingCode: TRACKING_CODE,
                referrer: REFERRER
            });

        // Validate returned order data
        assertTrue(retOrder.settlementTime != 0);
        assertTrue(retOrder.request.marketId == SETH_PERPS_MARKET_ID);
        assertTrue(retOrder.request.accountId == account.accountId());
        assertTrue(retOrder.request.sizeDelta == SIZE_DELTA);
        assertTrue(
            retOrder.request.settlementStrategyId == SETTLEMENT_STRATEGY_ID
        );
        assertTrue(retOrder.request.acceptablePrice == ACCEPTABLE_PRICE_LONG);
        assertTrue(retOrder.request.trackingCode == TRACKING_CODE);
        assertTrue(retOrder.request.referrer == REFERRER);

        // Validate fees
        assertTrue(fees != 0);
    }

    function test_commitOrder_invalid_market() public {
        vm.prank(ACTOR);

        vm.expectRevert("InvalidMarket");

        account.executeTrade({
            perpsMarketId: INVALID_PERPS_MARKET_ID,
            sizeDelta: SIZE_DELTA,
            settlementStrategyId: SETTLEMENT_STRATEGY_ID,
            acceptablePrice: ACCEPTABLE_PRICE_LONG,
            trackingCode: TRACKING_CODE,
            referrer: REFERRER
        });
    }

    function test_commitOrder_insufficient_collateral() public {
        vm.prank(ACTOR);

        vm.expectRevert("InsufficientMargin");

        account.executeTrade({
            perpsMarketId: SETH_PERPS_MARKET_ID,
            sizeDelta: SIZE_DELTA * SIZE_DELTA, // large value to ensure it fails
            settlementStrategyId: SETTLEMENT_STRATEGY_ID,
            acceptablePrice: ACCEPTABLE_PRICE_LONG,
            trackingCode: TRACKING_CODE,
            referrer: REFERRER
        });
    }

    function test_commitOrder_unauthorized() public {
        vm.prank(address(0xBAD));

        vm.expectRevert("Unauthorized");

        account.executeTrade({
            perpsMarketId: SETH_PERPS_MARKET_ID,
            sizeDelta: SIZE_DELTA,
            settlementStrategyId: SETTLEMENT_STRATEGY_ID,
            acceptablePrice: ACCEPTABLE_PRICE_LONG,
            trackingCode: TRACKING_CODE,
            referrer: REFERRER
        });
    }
}
