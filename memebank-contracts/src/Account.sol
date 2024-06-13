// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPerpsMarketProxy} from "./external/IPerpsMarketProxy.sol";
import {IEngine} from "./external/IEngine.sol";

/// @title Account
/// @notice Contract representing a user's trading account on Kwenta
contract Account is Ownable {
    IPerpsMarketProxy public perpsMarketProxy;
    IEngine public engine;
    IERC20 public sUSD;
    IERC20 public USDC;

    // ACTOR's account id in the Synthetix v3 perps market
    uint128 public accountId;

    /// @notice Emitted when collateral is deposited
    event CollateralDeposited(address indexed token, int256 amount);

    constructor(
        address _perpsMarketProxyAddress,
        address _engineAddress,
        address _sUSDAddress,
        address _usdcAddress
    ) Ownable(msg.sender) {
        perpsMarketProxy = IPerpsMarketProxy(_perpsMarketProxyAddress);
        engine = IEngine(_engineAddress);
        sUSD = IERC20(_sUSDAddress);
        USDC = IERC20(_usdcAddress);

        // Create account in Kwenta and grant permissions
        accountId = perpsMarketProxy.createAccount();
        perpsMarketProxy.grantPermission({
            accountId: accountId,
            permission: "ADMIN",
            user: address(engine)
        });
    }

    /// @notice Function to approve and deposit collateral
    /// @param amount The amount of collateral to deposit
    function depositCollateral(int256 amount) external onlyOwner {
        USDC.approve(address(engine), uint256(amount));
        
        engine.modifyCollateralZap({
            _accountId: accountId,
            _amount: amount
        });
        
        emit CollateralDeposited(address(USDC), amount);
    }

    /// @notice Function to execute a trade on Kwenta
    /// @param market The market to trade on
    /// @param amount The amount to trade
    function executeTrade(address market, uint256 amount) external onlyOwner {
        // Implement trade logic here using Kwenta's Engine
    }
}
