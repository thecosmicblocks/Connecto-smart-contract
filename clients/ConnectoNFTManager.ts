import { getCollectionData } from "../utils/nftMetadata";
import hre from "hardhat";
import { ethers, PayableOverrides } from "ethers";
import { ConnectoToken__factory } from "./../typechain/factories/ConnectoToken__factory";
import { ConnectoNFTManager__factory } from "./../typechain/factories/ConnectoNFTManager__factory";
import { ConnectoNFTManager } from "./../typechain/ConnectoNFTManager.d";
import { COLLECTION_CONFIG, CONTRACT_KEY } from "./../constants/index";
import {
  getAddress,
  getCreateCollectionSignature,
  getMintSignature,
  makeId,
} from "./../utils/index";
import { CollectionHelpersFactory } from "@unique-nft/solidity-interfaces";
import { ConnectoToken } from "../typechain/ConnectoToken";

async function main() {
  const { network } = hre;
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-opal.unique.network"
  );
  const payer = new ethers.Wallet(
    process.env.PRIVATE_KEY_DEPLOYER as string,
    provider
  );
  const signatureVerifier = new ethers.Wallet(
    process.env.PRIVATE_KEY_SIGNATUER_VERIFIER as string,
    provider
  );
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
  ///
  const connectoFee = 10_000_000_000_000;
  const mintTokenTx = await connectoToken.mint(payer.address, connectoFee);
  console.log("mint tx:", mintTokenTx.hash);
  await mintTokenTx.wait(1);
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
  const createCollectionOrderId = makeId(32);
  const createCollectionSig = await getCreateCollectionSignature(
    signatureVerifier,
    createCollectionOrderId,
    connectoFee,
    payer.address
  );
  const collectionMetadata = getCollectionData([]);
  const tx = await connectoNFTManager.createNFTCollection(
    payer.address,
    connectoFee,
    collectionMetadata.name,
    collectionMetadata.description,
    collectionMetadata.token_prefix,
    COLLECTION_CONFIG.collection.fileUrl,
    createCollectionOrderId,
    createCollectionSig,
    txConfig
  );
  console.log("createCollection tx: ", tx.hash);
  const createCollectionReceipt = await tx.wait(1);
  console.log("confirmed");
  // console.log(createCollectionReceipt);

  const newConnectionEvent = createCollectionReceipt.events?.filter(
    (event) => event.event === "NewCollection"
  )[0];
  if (!newConnectionEvent) throw new Error("Create collection failed!");

  const collectionAddr = (newConnectionEvent.args as any)
    .collectionAddress as string;
  console.log("collectionAddress", collectionAddr);

  const mintNftOrderId = makeId(32);
  const mintToCollectionSig = await getMintSignature(
    signatureVerifier,
    "mintToCollection",
    mintNftOrderId,
    collectionAddr,
    payer.address
  );
  const mintNftTx = await connectoNFTManager.mintToCollection(
    collectionAddr,
    payer.address,
    mintNftOrderId,
    mintToCollectionSig
  );
  console.log("mint NFT tx:", mintNftTx.hash);
  const mintNftReceipt = await mintNftTx.wait(1);
  console.log("confirmed");
  console.log(mintNftReceipt);
}
main().catch((error) => {
  console.error({ error });
});
