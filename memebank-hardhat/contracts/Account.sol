// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPerpsMarketProxy} from "./external/IPerpsMarketProxy.sol";
import {IEngine} from "./external/IEngine.sol";
import {ISynthetixCore} from "./external/ISynthetixCore.sol";
import {AccountFactory} from "./AccountFactory.sol";
import {MathLib} from "./libraries/MathLib.sol";
import "hardhat/console.sol";

/// @title Account
/// @notice Contract representing a user's trading account on Kwenta
contract Account is Ownable {
    using MathLib for int128;
    using MathLib for int256;
    using MathLib for uint256;

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

    // TODO: AccountFactory and Account should have same order of params
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
            user: address(0xd47e2d98D19ae808AEd402555110f047b2275087) // TODO: Change to PerpsManager
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

    // Utility function incase funds get stuck
    function withdrawToken(IERC20 _token, uint256 _amount) external onlyOwner {
        uint256 tokenBalance = _token.balanceOf(address(this));
        require(tokenBalance > 0, "Account doesn't have this token");
        _token.transfer(owner(), _amount);
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

            engine.modifyCollateral({
                _accountId: accountId,
                _amount: amount,
                _synthMarketId: synthMarketId
            });
        } else {
            // collateral withdrawn, don't need to request transfer from user
            emit CollateralWithdrawn(
                address(snxUSD),
                int256(amount),
                strategyType
            );
            engine.modifyCollateral({
                _accountId: accountId,
                _amount: amount,
                _synthMarketId: synthMarketId
            });
        }
    }

    function modifyCollateralZap(int256 amount) external payable onlyOwner {
        require(amount != 0, "Amount cannot be zero");
        if (amount > 0) {
            // Deposit into Kwenta
            emit CollateralDeposited(address(USDC), amount, strategyType);

            // Check if the sender has enough USDC to send
            require(
                USDC.balanceOf(msg.sender) >= uint256(amount),
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
        } else if (amount < 0) {
            // Withdraw from kwenta
            emit CollateralWithdrawn(address(USDC), amount, strategyType);

            // In order for the withdrawal to work here, the user must have snxUSD collateral
            // snxUSD is the only collateral supported right now for perps
            uint128 snxUSDMarketId = 0;
            uint256 collateralAmount = perpsMarketProxy.getCollateralAmount(
                accountId,
                snxUSDMarketId
            );

            require(amount > type(int256).min, "Withdrawal amount too large");
            // Make amount positive to see if they have the collateral amount they're trying to withdraw
            // TODO: Do this more like engine/perpsMarketProxy
            require(
                collateralAmount >= amount.abs256(),
                "Insufficient collateral for withdrawal"
            );

            engine.modifyCollateralZap({
                _accountId: accountId,
                _amount: amount
            });
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

    // Fetches value of an account
    function getTotalAccountBalance() external view returns (int256) {
        return perpsMarketProxy.getAvailableMargin(accountId);
    }
}
