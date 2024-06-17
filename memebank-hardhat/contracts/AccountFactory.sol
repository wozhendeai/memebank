// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPerpsMarketProxy} from "./external/IPerpsMarketProxy.sol";
import {IEngine} from "./external/IEngine.sol";
import "./Account.sol";
import "hardhat/console.sol";

/// @title AccountFactory
/// @notice Factory contract to create and manage accounts for Kwenta trading
contract AccountFactory is Ownable {
    IPerpsMarketProxy public perpsMarketProxy;
    IEngine public engine;
    IERC20 public sUSD;
    IERC20 public USDC;

    /// @notice Mapping from user address to list of owned account addresses
    mapping(address => address[]) public userAccounts;

    /// @notice Emitted when a new account is created
    event AccountCreated(address indexed account, address indexed creator);

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
    }

    /// @notice Function to create a new account
    /// @return address The address of the newly created account
    function createAccount() external returns (address) {
        Account newAccount = new Account({
            _perpsMarketProxy: perpsMarketProxy,
            _engine: engine,
            _sUSD: sUSD,
            _usdc: USDC,
            _accountFactory: AccountFactory(address(this))
        });

        // Transfer ownership to the account creator
        newAccount.transferOwnership(msg.sender);

        // Track the creation of the new account for the user
        userAccounts[msg.sender].push(address(newAccount));

        emit AccountCreated(address(newAccount), msg.sender);
        return address(newAccount);
    }

    /// @notice Retrieve all accounts associated with a user address.
    /// @param user The address of the user whose accounts we are retrieving.
    /// @return A list of addresses representing all the accounts created by the user.
    function getAccountsByUser(
        address user
    ) external view returns (address[] memory) {
        return userAccounts[user];
    }
}
