// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Account.sol";

/// @title AccountFactory
/// @notice Factory contract to create and manage accounts for Kwenta trading
contract AccountFactory is Ownable {
    address public kwentaProxy;
    address public kwentaEngine;
    address public collateralToken;

    /// @notice Emitted when a new account is created
    event AccountCreated(address indexed account, address indexed creator);

    constructor(address _kwentaProxy, address _kwentaEngine, address _collateralToken) {
        kwentaProxy = _kwentaProxy;
        kwentaEngine = _kwentaEngine;
        collateralToken = _collateralToken;
    }

    /// @notice Function to create a new account
    function createAccount() external returns (address) {
        Account newAccount = new Account(msg.sender, kwentaProxy, kwentaEngine, collateralToken);
        emit AccountCreated(address(newAccount), msg.sender);
        return address(newAccount);
    }
}
