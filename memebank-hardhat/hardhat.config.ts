import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { load } from 'ts-dotenv';
import "hardhat-gas-reporter"

const env = load({
    PRIVATE_KEY: String,
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ],
  },
  networks: {
    sepolia: {
      url: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/lzSHv83ZGfiUFE_YizE9vhXlAsViU7eE",
      accounts: [env.PRIVATE_KEY as string],
      forking: {
        url: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/lzSHv83ZGfiUFE_YizE9vhXlAsViU7eE",
      }
    }
  },
  gasReporter: {
    L2: "base",
    gasPrice: 1
  }
};

export default config;
