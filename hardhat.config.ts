import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import env from "./src/utils/env";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1,
      hardfork: "london",
      loggingEnabled: true,
      gasPrice: 100e9,
      // mining: {
      //   auto: false,
      // },
      forking: {
        url: env.FORK_NODE_HTTP,
        // blockNumber: 13284254,
      },
    },
  },
  // solidity: "0.8.4",
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
