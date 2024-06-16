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
    AccountFactory public accountFactory;

    // ACTOR's account id in the Synthetix v3 perps market
    uint128 public accountId;

    /// @notice Emitted when collateral is deposited
    event CollateralDeposited(address indexed token, int256 amount);

    /// @notice Emitted when contract addresses are updated
    event AddressesUpdated(
        IPerpsMarketProxy perpsMarketProxy,
        IEngine engine,
        IERC20 sUSD,
        IERC20 USDC
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
        AccountFactory _accountFactory
    ) Ownable(msg.sender) {
        perpsMarketProxy = _perpsMarketProxy;
        engine = _engine;
        sUSD = _sUSD;
        USDC = _usdc;
        accountFactory = _accountFactory;

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
        require(
            sUSD.approve(address(engine), type(uint256).max),
            "sUSD approval failed"
        );
        require(
            USDC.approve(address(engine), type(uint256).max),
            "sUSD approval failed"
        );
    }

    /// @notice Function to approve and deposit collateral
    /// @param amount The amount of collateral to deposit
    // TODO: Should be named `modifyCollateral`
    function depositCollateral(uint256 amount) external payable onlyOwner {
        emit CollateralDeposited(address(sUSD), int256(amount));

        // Transfer sUSD tokens from the caller to the Account contract
        bool success = sUSD.transferFrom(msg.sender, address(this), amount);
        require(success, "sUSD transfer failed");

        // TODO: Maybe make synMarketId a param
        engine.modifyCollateral({
            _accountId: accountId,
            _amount: int256(amount),
            _synthMarketId: 1
        });
    }

    function modifyCollateralZap(uint256 amount) external payable onlyOwner {
        emit CollateralDeposited(address(USDC), int256(amount));

        // Transfer sUSD tokens from the caller to the Account contract
        bool success = USDC.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        // TODO: Maybe make synMarketId a param
        engine.modifyCollateralZap({
            _accountId: accountId,
            _amount: int256(amount)
        });
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
        external
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

    // TODO: I don't think we even have to worry about this?
    /// @notice Updates the addresses of perpsMarketProxy, engine, sUSD, and USDC from the AccountFactory
    function updateAddresses() external onlyOwner {
        IPerpsMarketProxy newPerpsMarketProxy = accountFactory
            .perpsMarketProxy();
        IEngine newEngine = accountFactory.engine();
        IERC20 newSUSD = accountFactory.sUSD();
        IERC20 newUSDC = accountFactory.USDC();

        perpsMarketProxy = newPerpsMarketProxy;
        engine = newEngine;
        sUSD = newSUSD;
        USDC = newUSDC;

        emit AddressesUpdated(perpsMarketProxy, engine, sUSD, USDC);
    }
}
