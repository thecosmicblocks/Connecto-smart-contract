import { CONTRACT_KEY } from "../constants/index";
import hre from "hardhat";
import "@nomiclabs/hardhat-etherscan";
import { appendAddress, getAddress, sleep } from "../utils";

async function main() {
  const { ethers, network, config } = hre;
  const [payer] = await ethers.getSigners();
  const contract = await ethers.getContractFactory("ConnectoNFTManager");
  const deployedContract = await contract.deploy(
    process.env.ADDRESS_OWNER as string,
    process.env.ADDRESS_COLLECTION_HELPER as string,
    getAddress(network.name, CONTRACT_KEY.CONNECTO_TOKEN),
    payer.address
  );
  await deployedContract.deployed();

  console.log("ConnectoNFTManager deployed to:", deployedContract.address);

  appendAddress(
    network.name,
    deployedContract.address,
    CONTRACT_KEY.CONNECTO_NFT_MANAGER
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
