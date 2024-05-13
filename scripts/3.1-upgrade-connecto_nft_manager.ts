import { CONTRACT_KEY } from "../constants/index";
import hre from "hardhat";
import "@nomiclabs/hardhat-etherscan";
import { appendAddress, getAddress, sleep } from "../utils";

async function main() {
  const { ethers, network, config, upgrades } = hre;
  const contract = await ethers.getContractFactory("ConnectoNFTManager");
  const deployedContract = await upgrades.upgradeProxy(
    getAddress(network.name, CONTRACT_KEY.CONNECTO_NFT_MANAGER),
    contract
  );
  await deployedContract.deployed();
  const implAddr = await upgrades.erc1967.getImplementationAddress(
    deployedContract.address
  );
  console.log("ConnectoNFTManager Implementation upgraded to:", implAddr);

  appendAddress(network.name, implAddr, CONTRACT_KEY.CONNECTO_NFT_MANAGER_IMPL);

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
