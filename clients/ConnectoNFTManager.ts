import { ConnectoToken__factory } from "./../typechain/factories/ConnectoToken__factory";
import { ConnectoNFTManager__factory } from "./../typechain/factories/ConnectoNFTManager__factory";
import { ConnectoNFTManager } from "./../typechain/ConnectoNFTManager.d";
import { CONTRACT_KEY } from "./../constants/index";
import { getAddress } from "./../utils/index";
import hre from "hardhat";
import { PayableOverrides } from "ethers";
import { CollectionHelpersFactory } from "@unique-nft/solidity-interfaces";
import { ConnectoToken } from "../typechain/ConnectoToken";

async function main() {
  const { ethers, network } = hre;
  const [payer] = await ethers.getSigners();

  const connectoNFTManager = new ethers.Contract(
    getAddress(network.name, CONTRACT_KEY.CONNECTO_NFT_MANAGER),
    ConnectoNFTManager__factory.abi,
    payer
  ) as unknown as ConnectoNFTManager;
  const connectoToken = new ethers.Contract(
    getAddress(network.name, CONTRACT_KEY.CONNECTO_TOKEN),
    ConnectoToken__factory.abi,
    payer
  ) as unknown as ConnectoToken;
  const collectionHelpers = await CollectionHelpersFactory(payer, ethers);
  /// ======================================
  const connectoFee = await connectoNFTManager.getConnectoFee();
  const mintTx = await connectoToken.mint(payer.address, connectoFee);
  console.log("mint tx:", mintTx.hash);
  await mintTx.wait(1);
  console.log("confirmed");
  const approveTx = await connectoToken.approve(
    connectoNFTManager.address,
    connectoFee
  );
  console.log("approve tx:", approveTx.hash);
  await approveTx.wait(1);
  console.log("confirmed");

  const txConfig: PayableOverrides = {
    gasLimit: 10_000_000,
    value: await collectionHelpers.collectionCreationFee(),
  };
  const tx = await connectoNFTManager.createCollection(
    payer.address,
    payer.address,
    "Daniel's Collection",
    "Daniel NFT in Unique Network",
    "DNFT",
    "https://vysqx2xl6dtci6kru66bgehqx7ooypjq2g3nlde7udgxhpdkv3dq.arweave.net/riUL6uvw5iR5Uae8ExDwv9zsPTDRttWMn6DNc7xqrsc/",
    txConfig
  );
  console.log("createCollection tx: ", tx.hash);
  const createCollectionReceipt = await tx.wait(1);
  console.log("confirmed");
  // console.log(createCollectionReceipt);
  const newConnectionEvent = createCollectionReceipt.events?.filter(
    (event) => event.event === "CollectionCreated"
  )[0];
  if (!newConnectionEvent) throw new Error("Create collection failed!");
  // TODO: why does collectionAddr not exist on https://opal.subscan.io/account/0x17c4e6453cc49aaaaeaca894e6d9683e00000acd ?
  const collectionAddr = (newConnectionEvent.args as any)
    .collectionAddress as string;
  console.log("collectionAddress", collectionAddr);

  const mintNftTx = await connectoNFTManager.mintToCollection(
    collectionAddr,
    payer.address
  );
  console.log("mint NFT tx:", mintNftTx.hash);
  const mintNftReceipt = await mintNftTx.wait(1);
  console.log("confirmed");
  console.log(mintNftReceipt);
}
main().catch((error) => {
  console.error({ error });
});
