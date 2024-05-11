import "@nomiclabs/hardhat-etherscan";
import hre from "hardhat";
import { CONTRACT_KEY } from "../constants";
import { appendAddress, sleep } from "../utils";

async function main() {
  const { ethers, network, upgrades, config } = hre;
  const contract = await ethers.getContractFactory("ConnectoToken");
  const deployedContract = await upgrades.deployProxy(
    contract,
    ["Connecto Token", "CT"],
    {
      initializer: "initialize",
    }
  );
  await deployedContract.deployed();
  console.log("ConnectoToken deployed to:", deployedContract.address);
  appendAddress(
    network.name,
    deployedContract.address,
    CONTRACT_KEY.CONNECTO_TOKEN
  );

  if (
    !config.etherscan.apiKey || /// not configure apiKey
    (typeof config.etherscan.apiKey !== "string" && /// apiKey is an object
      !config.etherscan.apiKey[network.name]) /// not configure apiKey for network
  )
    return;

  await sleep(5000);
  await hre.run("verify:verify", {
    address: deployedContract.address,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
