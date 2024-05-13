import { ethers, upgrades } from "hardhat";
import { PayableOverrides } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ConnectoNFTManager, ConnectoToken } from "../typechain";
import { getCreateCollectionSignature, makeId } from "../utils";
import { getCollectionData } from "../utils/nftMetadata";
import { COLLECTION_CONFIG } from "../constants";
import { expect } from "chai";

describe("ConnectoNFTManager", function () {
  let connectoNFTManager: ConnectoNFTManager, connectoToken: ConnectoToken;
  let payer: SignerWithAddress, signatureVerifier: SignerWithAddress;

  before(async () => {
    [payer, signatureVerifier] = await ethers.getSigners();

    const ConnectoTokenFactory = await ethers.getContractFactory(
      "ConnectoToken"
    );
    connectoToken = (await upgrades.deployProxy(
      ConnectoTokenFactory,
      ["Connecto Token", "CT"],
      {
        initializer: "initialize",
      }
    )) as unknown as ConnectoToken;

    const ConnectoNFTManager = await ethers.getContractFactory(
      "ConnectoNFTManager"
    );
    connectoNFTManager = (await upgrades.deployProxy(
      ConnectoNFTManager,
      [
        process.env.ADDRESS_COLLECTION_HELPER as string,
        connectoToken.address,
        process.env.ADDRESS_TREASURY,
        signatureVerifier.address,
        process.env.ADDRESS_OWNER as string,
      ],
      { initializer: "initialize" }
    )) as unknown as ConnectoNFTManager;
  });

  it("Should create collection", async function () {
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
      value: ethers.utils.parseEther("2"),
    };
    const createCollectionOrderId = makeId(32);
    const createCollectionSig = await getCreateCollectionSignature(
      signatureVerifier,
      createCollectionOrderId,
      connectoFee,
      payer.address
    );
    const collectionData = getCollectionData([]);
    // const tx = await connectoNFTManager.createCollection(
    //   getCollectionData([]),
    //   payer.address,
    //   connectoFee,
    //   "https://ipfs.unique.network/ipfs/{id}",
    //   createCollectionOrderId,
    //   createCollectionSig,
    //   txConfig
    // );
    const tx = await connectoNFTManager.createNFTCollection(
      payer.address,
      connectoFee,
      collectionData.name,
      collectionData.description,
      collectionData.token_prefix,
      COLLECTION_CONFIG.collection.fileUrl,
      createCollectionOrderId,
      createCollectionSig,
      txConfig
    );
    console.log("createCollection tx: ", tx.hash);
    const createCollectionReceipt = await tx.wait(1);
    expect(createCollectionReceipt).to.be.emit(
      connectoNFTManager,
      "NewCollection"
    );
    console.log("confirmed");
    console.log(createCollectionReceipt);
  });
});
