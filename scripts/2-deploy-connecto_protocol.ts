import { CONTRACT_KEY } from "../constants/index";
import hre from "hardhat";
import "@nomiclabs/hardhat-etherscan";
import { appendAddress, sleep } from "../utils";

async function main() {
  const { ethers, network, upgrades, config } = hre;
  const contract = await ethers.getContractFactory("ConnectoProtocol");
  const deployedContract = await upgrades.deployProxy(
    contract,
    [
      process.env.ADDRESS_OWNER,
      process.env.ADDRESS_TREASURY,
      50, // aka 5%
    ],
    {
      initializer: "initialize",
    }
  );
  await deployedContract.deployed();

  console.log("ConnectoProtocol deployed to:", deployedContract.address);
  const implAddr = await upgrades.erc1967.getImplementationAddress(
    deployedContract.address
  );

  appendAddress(
    network.name,
    deployedContract.address,
    CONTRACT_KEY.CONNECTO_PROTOCOL
  );
  appendAddress(network.name, implAddr, CONTRACT_KEY.CONNECTO_PROTOCOL_IMPL);
  if (
    !config.etherscan.apiKey || /// not configure apiKey
    (typeof config.etherscan.apiKey !== "string" && /// apiKey is an object
      !config.etherscan.apiKey[network.name]) /// not configure apiKey for network
  )
    return;

  await sleep(5000);
  await hre.run("verify:verify", {
    address: implAddr,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
