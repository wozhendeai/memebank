// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Account.sol";

/// @title AccountFactory
/// @notice Factory contract to create and manage accounts for Kwenta trading
contract AccountFactory is Ownable {
    address public perpsMarketProxy;
    address public engine;
    address public sUSD;
    address public USDC;

    /// @notice Emitted when a new account is created
    event AccountCreated(address indexed account, address indexed creator);

    constructor(
        address _perpsMarketProxy,
        address _engine,
        address _sUSD,
        address _USDC
    ) Ownable(msg.sender) {
        perpsMarketProxy = _perpsMarketProxy;
        engine = _engine;
        sUSD = _sUSD;
        USDC = _USDC;
    }

    /// @notice Function to create a new account
    function createAccount() external returns (address) {
        Account newAccount = new Account(
            perpsMarketProxy,
            engine,
            sUSD,
            USDC
        );
        emit AccountCreated(address(newAccount), msg.sender);
        newAccount.transferOwnership(msg.sender); // Transfer ownership to the account creator
        return address(newAccount);
    }
}
