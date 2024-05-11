/* eslint-disable node/no-missing-import */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

import "@nomiclabs/hardhat-etherscan";
import { getAddress } from "../utils";

async function main() {
  const { network } = hre;

  const temp = {
    MY_ERC20: {
      address: getAddress(network.name, "MyToken"),
      constructorArguments: [],
    },
  };

  await hre.run("verify:verify", {
    address: temp.MY_ERC20.address,
    constructorArguments: temp.MY_ERC20.constructorArguments,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
