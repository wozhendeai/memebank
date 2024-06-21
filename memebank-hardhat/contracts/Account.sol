// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPerpsMarketProxy} from "./external/IPerpsMarketProxy.sol";
import {IEngine} from "./external/IEngine.sol";
import {ISynthetixCore} from "./external/ISynthetixCore.sol";
import {AccountFactory} from "./AccountFactory.sol";
import "hardhat/console.sol";

/// @title Account
/// @notice Contract representing a user's trading account on Kwenta
contract Account is Ownable {
    IPerpsMarketProxy public perpsMarketProxy;
    IEngine public engine;
    IERC20 public sUSD;
    IERC20 public USDC;
    IERC20 public snxUSD;
    AccountFactory public accountFactory;
    AccountFactory.StrategyType public strategyType;

    // ACTOR's account id in the Synthetix v3 perps market
    uint128 public accountId;

    /// @notice Emitted when collateral is deposited
    event CollateralDeposited(
        address indexed token,
        int256 amount,
        AccountFactory.StrategyType strategyType
    );
    event CollateralWithdrawn(
        address indexed token,
        int256 amount,
        AccountFactory.StrategyType strategyType
    );

    /// @notice Emitted when an order is committed
    event OrderCommitted(
        IPerpsMarketProxy.Data retOrder,
        uint128 perpsMarketId,
        uint128 accountId,
        int128 sizeDelta,
        uint128 settlementStrategyId,
        uint256 acceptablePrice,
        bytes32 trackingCode,
        uint256 fees
    );

    constructor(
        IPerpsMarketProxy _perpsMarketProxy,
        IEngine _engine,
        IERC20 _sUSD,
        IERC20 _usdc,
        IERC20 _snxUSD,
        AccountFactory _accountFactory,
        AccountFactory.StrategyType _strategyType
    ) Ownable(msg.sender) {
        perpsMarketProxy = _perpsMarketProxy;
        engine = _engine;
        sUSD = _sUSD;
        USDC = _usdc;
        snxUSD = _snxUSD;
        accountFactory = _accountFactory;
        strategyType = _strategyType;

        // Initiate a Synthetix v3 Account
        accountId = perpsMarketProxy.createAccount();

        // Assign admin permission to Kwenta's Engine
        perpsMarketProxy.grantPermission({
            accountId: accountId,
            permission: "ADMIN",
            user: address(engine)
        });

        // Grant additional permissions to AccountFactory
        perpsMarketProxy.grantPermission({
            accountId: accountId,
            permission: "ADMIN",
            user: address(accountFactory)
        });

        // Approve the Engine to manage collateral
        // TODO: Check if sUSD approval is necessary
        require(
            sUSD.approve(address(engine), type(uint256).max),
            "sUSD approval failed"
        );
        // For `modifyCollateralZap`
        require(
            USDC.approve(address(engine), type(uint256).max),
            "sUSD approval failed"
        );
        // For `modifyCollateral`, at this time only snxUSD is supported as perp collateral
        require(
            snxUSD.approve(address(engine), type(uint256).max),
            "sUSD approval failed"
        );

    }

    /// @notice Function to approve and deposit collateral
    /// @param amount The amount of collateral to deposit
    function modifyCollateral(
        int256 amount,
        uint128 synthMarketId
    ) external payable onlyOwner {
        if (amount > 0) {
            // collateral deposited
            emit CollateralDeposited(
                address(sUSD),
                int256(amount),
                strategyType
            );
            // unsafe typecast or is it? cause its definitely positive
            bool success = snxUSD.transferFrom(
                msg.sender,
                address(this),
                uint256(amount)
            );
            require(success, "snxUSD transfer failed");
        } else {
            // collateral withdrawn, don't need to request transfer from user
            emit CollateralWithdrawn(
                address(snxUSD),
                int256(amount),
                strategyType
            );
        }

        engine.modifyCollateral({
            _accountId: accountId,
            _amount: amount,
            _synthMarketId: synthMarketId
        });
    }

    function modifyCollateralZap(int256 amount) external payable onlyOwner {
        require(!(amount == 0), "Amount cannot be zero");
        if (amount > 0) {
            console.log("Depositing...");
            // Deposit into Kwenta
            emit CollateralDeposited(address(USDC), amount, strategyType);

            // Check if the sender has enough USDC to send
            require(
                int256(USDC.balanceOf(msg.sender)) >= amount,
                "Insufficient funds, click the gear icon to top up your USDC balance using Coinbase."
            );

            // Transfer sUSD tokens from the caller to the Account contract
            bool success = USDC.transferFrom(
                msg.sender,
                address(this),
                uint256(amount)
            );
            require(success, "USDC transfer failed");

            engine.modifyCollateralZap({
                _accountId: accountId,
                _amount: amount
            });
            console.log("Deposited");
        } else if (amount < 0) {
            console.log("Withdrawal pending...");
            // Withdraw from kwenta
            emit CollateralWithdrawn(address(USDC), amount, strategyType);

            // In order for the withdrawal to work here, the user must have snxUSD collateral
            // snxUSD is the only collateral supported right now for perps
            uint128 snxUSDMarketId = 0;
            uint256 collateralAmount = perpsMarketProxy.getCollateralAmount(
                accountId,
                snxUSDMarketId
            );
            console.log(collateralAmount);
            require(amount > type(int256).min, "Withdrawal amount too large");
            // Make amount positive to see if they have the collateral amount they're trying to withdraw
            // TODO: Do this more like engine/perpsMarketProxy
            require(
                collateralAmount >= uint256(-amount),
                "Insufficient collateral for withdrawal"
            );

            engine.modifyCollateralZap({
                _accountId: accountId,
                _amount: amount
            });
            console.log("Withdrawed");
        }
    }

    /// @notice Function to execute a trade on Kwenta
    /// @param perpsMarketId The ID of the perpetual market
    /// @param sizeDelta The size delta for the trade
    /// @param settlementStrategyId The ID of the settlement strategy
    /// @param acceptablePrice The acceptable price for the trade
    /// @param trackingCode The tracking code for the trade
    function executeTrade(
        uint128 perpsMarketId,
        int128 sizeDelta,
        uint128 settlementStrategyId,
        uint256 acceptablePrice,
        bytes32 trackingCode
    )
        public
        onlyOwner
        returns (IPerpsMarketProxy.Data memory retOrder, uint256 fees)
    {
        (retOrder, fees) = engine.commitOrder({
            _perpsMarketId: perpsMarketId,
            _accountId: accountId,
            _sizeDelta: sizeDelta,
            _settlementStrategyId: settlementStrategyId,
            _acceptablePrice: acceptablePrice,
            _trackingCode: trackingCode,
            _referrer: address(accountFactory)
        });
        // @note Necessary to emit event after external call as we don't have fee/retOrder data
        //slither-disable-next-line low-level-calls
        emit OrderCommitted(
            retOrder,
            perpsMarketId,
            accountId,
            sizeDelta,
            settlementStrategyId,
            acceptablePrice,
            trackingCode,
            fees
        );
    }

    // TODO: Check gas difference of internal and debate if its worth it
    function closePosition(uint128 marketId) public onlyOwner {
        (, , int128 positionSize, ) = perpsMarketProxy.getOpenPosition(
            accountId,
            marketId
        );
        uint256 acceptablePrice = perpsMarketProxy.indexPrice(marketId);

        executeTrade(marketId, -positionSize, 0, acceptablePrice, bytes32(0));
    }

    function closeAllPositions() external onlyOwner {
        uint256[] memory openPositionMarketIds = perpsMarketProxy
            .getAccountOpenPositions(accountId);
        for (uint256 i = 0; i < openPositionMarketIds.length; i++) {
            uint256 marketId = openPositionMarketIds[i];

            closePosition(uint128(marketId)); // Add safe cast?
        }
    }

    // @notice Get's all the collateral a user has
    function getAllCollateral()
        public
        view
        returns (uint256[] memory, uint256[] memory)
    {
        uint256[] memory collateralIds = perpsMarketProxy
            .getAccountCollateralIds(accountId);
        uint256[] memory collateralAmounts = new uint256[](
            collateralIds.length
        );

        for (uint256 i = 0; i < collateralIds.length; i++) {
            collateralAmounts[i] = perpsMarketProxy.getCollateralAmount(
                accountId,
                uint128(collateralIds[i])
            );
        }

        return (collateralIds, collateralAmounts);
    }

    function closeAllAndWithdraw() external onlyOwner {
        this.closeAllPositions();

        // Get all collateral a user has
        (
            uint256[] memory collateralIds,
            uint256[] memory collateralAmounts
        ) = getAllCollateral();

        // Withdraw each type of collateral
        for (uint256 i = 0; i < collateralIds.length; i++) {
            uint128 synthMarketId = uint128(collateralIds[i]);
            int256 collateralAmount = int256(collateralAmounts[i]);

            this.modifyCollateral(-collateralAmount, synthMarketId);
        }
    }

    // Utility function incase funds get stuck
    function withdrawToken(address erc20) external onlyOwner {
        IERC20 token = IERC20(erc20);
        uint256 tokenBalance = token.balanceOf(address(this));
        require(tokenBalance > 0, "Account doesn't have this token");
        IERC20(erc20).transfer(owner(), tokenBalance);
    }

    // Fetches value of an account
    function getTotalAccountBalance() external view returns (int256) {
        return perpsMarketProxy.getAvailableMargin(accountId);
    }
}
