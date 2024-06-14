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

    /// @notice Emitted when a new account is created
    event AccountCreated(address indexed account, address indexed creator);
    
    /// @notice Emitted when contract addresses are updated
    event AddressesUpdated(
        IPerpsMarketProxy perpsMarketProxy,
        IEngine engine,
        IERC20 sUSD,
        IERC20 USDC
    );

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
        
        emit AccountCreated(address(newAccount), msg.sender);
        return address(newAccount);
    }

    /// @notice Function to update the addresses of perpsMarketProxy, engine, sUSD, and USDC
    /// @param newPerpsMarketProxy The new address of the PerpsMarketProxy
    /// @param newEngine The new address of the Engine
    /// @param newSUSD The new address of the sUSD token
    /// @param newUSDC The new address of the USDC token
    function updateAddresses(
        address newPerpsMarketProxy,
        address newEngine,
        address newSUSD,
        address newUSDC
    ) external onlyOwner {
        perpsMarketProxy = IPerpsMarketProxy(newPerpsMarketProxy);
        engine = IEngine(newEngine);
        sUSD = IERC20(newSUSD);
        USDC = IERC20(newUSDC);

        emit AddressesUpdated(IPerpsMarketProxy(newPerpsMarketProxy), IEngine(newEngine), IERC20(newSUSD), IERC20(newUSDC));
    }
}
