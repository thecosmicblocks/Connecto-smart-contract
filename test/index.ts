import { expect, assert } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract, Signer } from "ethers";
import { zeroAddress } from "@nomicfoundation/ethereumjs-util";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ConnectoNFTManager, ConnectoToken } from "../typechain";

describe("ConnectoNFTManager", function () {
  let connectoNFTManager: ConnectoNFTManager, connectoToken: ConnectoToken;
  let owner: SignerWithAddress, signatureVerifier: SignerWithAddress;

  before(async () => {
    [owner, signatureVerifier] = await ethers.getSigners();

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

    connectoNFTManager = (await ethers.deployContract("ConnectoNFTManager", [
      owner.address,
      connectoToken.address, /// collectionHelper_
      connectoToken.address,
      owner.address,
    ])) as unknown as ConnectoNFTManager;
  });

  it("Should create collection", async function () { });
});
