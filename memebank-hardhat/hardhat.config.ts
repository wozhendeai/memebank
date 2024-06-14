import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'

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
      forking: {
        url: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/lzSHv83ZGfiUFE_YizE9vhXlAsViU7eE",
      }
    }
  }  
};

export default config;
