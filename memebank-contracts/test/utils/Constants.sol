// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Contract for defining constants used in testing
contract Constants {
    uint256 public constant BASE_BLOCK_NUMBER = 8_225_680;

    address internal constant OWNER = address(0x01);
    address internal constant ACTOR = address(0x02);
    address internal constant REFERRER = address(0x03);
    int128 internal constant SIZE_DELTA = 1 ether / 100;
    uint256 internal constant ACCEPTABLE_PRICE_LONG = type(uint256).max;
    bytes32 internal constant TRACKING_CODE = "KWENTA";
    uint128 internal constant SETTLEMENT_STRATEGY_ID = 0;
    uint128 internal constant SETH_PERPS_MARKET_ID = 200;
    uint256 internal constant AMOUNT = 10_000 ether;

    address internal constant PERPS_MARKET_PROXY_ADDRESS =
        0xe5bB889B1f0B6B4B7384Bd19cbb37adBDDa941a6;
    address internal constant ENGINE_ADDRESS =
        0x33B725a1B2dE9178121D423D2A1c062C5452f310;
    address internal constant SUSD_ADDRESS =
        0x8069c44244e72443722cfb22DcE5492cba239d39;
    address internal constant USDC_ADDRESS =
        0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    uint128 internal constant INVALID_PERPS_MARKET_ID = type(uint128).max;
}
