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
        bytes memory bytecode = type(Account).creationCode;
        bytecode = abi.encodePacked(
            bytecode,
            abi.encode(
                perpsMarketProxy,
                engine,
                sUSD,
                USDC,
                AccountFactory(address(this))
            )
        );

        // Generate a salt based on the sender and perhaps other factors
        bytes32 salt = keccak256(
            abi.encodePacked(msg.sender, userAccounts[msg.sender].length)
        );

        address newAccountAddress;

        // Deploy the contract using CREATE2
        assembly {
            newAccountAddress := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }

        // Transfer ownership of SC to user
        Account newAccount = Account(newAccountAddress);
        newAccount.transferOwnership(msg.sender);
        // Add to list of new accounts
        userAccounts[msg.sender].push(newAccountAddress);

        emit AccountCreated(newAccountAddress, msg.sender);
        return newAccountAddress;
    }

    // Determines what the next address of account user creates will be
    function determineNewAccountAddress(
        address sender
    ) public view returns (address) {
        bytes memory bytecode = type(Account).creationCode;
        bytecode = abi.encodePacked(
            bytecode,
            abi.encode(
                perpsMarketProxy,
                engine,
                sUSD,
                USDC,
                AccountFactory(address(this))
            )
        );
        bytes32 salt = keccak256(
            abi.encodePacked(sender, userAccounts[sender].length)
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );

        return address(uint160(uint256(hash)));
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
