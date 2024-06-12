// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@synthetixio/core-modules/contracts/interfaces/IAccountProxy.sol";
import "@synthetixio/core-modules/contracts/interfaces/IEngine.sol";

/// @title Account
/// @notice Contract representing a user's trading account on Kwenta
contract Account {
    address public owner;
    address public kwentaProxy;
    address public kwentaEngine;
    address public collateralToken;

    /// @notice Emitted when collateral is deposited
    event CollateralDeposited(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _owner, address _kwentaProxy, address _kwentaEngine, address _collateralToken) {
        owner = _owner;
        kwentaProxy = _kwentaProxy;
        kwentaEngine = _kwentaEngine;
        collateralToken = _collateralToken;

        // Create account in Kwenta and grant permissions
        IAccountProxy(kwentaProxy).createAccount();
        IAccountProxy(kwentaProxy).grantPermission(address(this), kwentaEngine);
    }

    /// @notice Function to approve and deposit collateral
    /// @param amount The amount of collateral to deposit
    function depositCollateral(uint256 amount) external onlyOwner {
        IERC20(collateralToken).transferFrom(msg.sender, address(this), amount);
        IERC20(collateralToken).approve(kwentaEngine, amount);
        IEngine(kwentaEngine).modifyCollateral(address(this), collateralToken, int256(amount));
        emit CollateralDeposited(collateralToken, amount);
    }

    /// @notice Function to execute a trade on Kwenta
    /// @param market The market to trade on
    /// @param amount The amount to trade
    function executeTrade(address market, uint256 amount) external onlyOwner {
        // Implement trade logic here using Kwenta's Engine
    }
}
