import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ConnectoMarketplace, ConnectoToken, MyERC721 } from "../typechain";
import { getListingSignature, timestampToEpochTime } from "../utils";
import { NATIVE_TOKEN, ListingType } from "../constants";
import moment from "moment";

describe("ConnectoNFTManager", function () {
  let connectoMarketplace: ConnectoMarketplace,
    connectoToken: ConnectoToken,
    myErc721: MyERC721;
  let payer: SignerWithAddress,
    seller: SignerWithAddress,
    buyer: SignerWithAddress;
  let listingId = 0;

  before(async () => {
    [payer, seller, buyer] = await ethers.getSigners();

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

    const ConnectoMarketplaceFactory = await ethers.getContractFactory(
      "ConnectoMarketplace"
    );
    connectoMarketplace = (await upgrades.deployProxy(
      ConnectoMarketplaceFactory,
      [
        process.env.ADDRESS_OWNER as string,
        process.env.ADDRESS_TREASURY,
        50, // AKA 5%
      ],
      { initializer: "initialize" }
    )) as unknown as ConnectoMarketplace;

    const MyERC721Factory = await ethers.getContractFactory("MyERC721");
    myErc721 = (await MyERC721Factory.deploy()) as unknown as MyERC721;
  });

  it("Should 'buy' by Native Token", async function () {
    /// mint erc721
    const mintErc721Tx = await (
      await myErc721.connect(seller).mint(seller.address)
    ).wait(1);
    expect(mintErc721Tx).to.be.emit(myErc721, "Transfer");
    const tokenId = mintErc721Tx.events?.find(
      (event) => event.event === "Transfer"
    )?.args?.tokenId;

    /// approve erc721
    const approveErc721Tx = await (
      await myErc721
        .connect(seller)
        .approve(connectoMarketplace.address, tokenId)
    ).wait(1);
    expect(approveErc721Tx).to.be.emit(myErc721, "Approval");

    /// create signature
    listingId++;
    const listing = {
      listingId: listingId,
      tokenOwner: seller.address,
      assetContract: myErc721.address,
      tokenId: tokenId,
      startTime: timestampToEpochTime(moment().subtract(1, "hour").toDate()),
      endTime: timestampToEpochTime(moment().add(1, "hour").toDate()),
      currency: NATIVE_TOKEN,
      reservePricePerToken: ethers.utils.parseEther("1"),
      buyoutPricePerToken: ethers.utils.parseEther("2"),
      listingType: ListingType.Direct,
    };
    const listingSig = await getListingSignature(seller, listing);
    /// call buy
    const buyTx = await (
      await connectoMarketplace
        .connect(buyer)
        .buy(listing, buyer.address, listingSig, {
          value: listing.buyoutPricePerToken,
        })
    ).wait(1);

    expect(buyTx).to.be.emit(connectoMarketplace, "NewSale");
    const ownerOf = await myErc721.ownerOf(tokenId);
    expect(ethers.utils.getAddress(ownerOf.toString())).to.be.eq(buyer.address);
  });

  it("Should 'buy' by ConnectoToken", async function () {
    /// mint erc721
    const mintErc721Tx = await (
      await myErc721.connect(seller).mint(seller.address)
    ).wait(1);
    expect(mintErc721Tx).to.be.emit(myErc721, "Transfer");
    const tokenId = mintErc721Tx.events?.find(
      (event) => event.event === "Transfer"
    )?.args?.tokenId;

    /// approve erc721
    const approveErc721Tx = await (
      await myErc721
        .connect(seller)
        .approve(connectoMarketplace.address, tokenId)
    ).wait(1);
    expect(approveErc721Tx).to.be.emit(myErc721, "Approval");

    /// create signature
    listingId++;
    const listing = {
      listingId: listingId,
      tokenOwner: seller.address,
      assetContract: myErc721.address,
      tokenId: tokenId,
      startTime: timestampToEpochTime(moment().subtract(1, "hour").toDate()),
      endTime: timestampToEpochTime(moment().add(1, "hour").toDate()),
      currency: connectoToken.address,
      reservePricePerToken: ethers.utils.parseEther("1"),
      buyoutPricePerToken: ethers.utils.parseEther("2"),
      listingType: ListingType.Direct,
    };
    const listingSig = await getListingSignature(seller, listing);

    /// mint ConnectoToken
    const mintTokenTx = await (
      await connectoToken
        .connect(buyer)
        .mint(buyer.address, listing.buyoutPricePerToken)
    ).wait(1);
    expect(mintTokenTx).to.be.emit(connectoToken, "Transfer");

    /// approve ConnectoToken
    const approveTokenTx = await (
      await connectoToken
        .connect(buyer)
        .approve(connectoMarketplace.address, listing.buyoutPricePerToken)
    ).wait(1);
    expect(approveTokenTx).to.be.emit(connectoToken, "Approval");
    const allowance = (
      await connectoToken.allowance(buyer.address, connectoMarketplace.address)
    ).toString();
    expect(allowance).to.be.eq(listing.buyoutPricePerToken.toString());

    /// call buy
    const buyTx = await (
      await connectoMarketplace
        .connect(buyer)
        .buy(listing, buyer.address, listingSig)
    ).wait(1);

    expect(buyTx).to.be.emit(connectoMarketplace, "NewSale");
    const ownerOf = await myErc721.ownerOf(tokenId);
    expect(ethers.utils.getAddress(ownerOf.toString())).to.be.eq(buyer.address);

    /// call claim
    const sellerClaimTx = await (
      await connectoMarketplace
        .connect(seller)
        .claim(seller.address, connectoToken.address)
    ).wait(1);
    expect(sellerClaimTx).to.be.emit(connectoToken, "Transfer");
    const balanceOfSellerAfter = await connectoToken.balanceOf(seller.address);
    console.log("balanceOfSellerAfter", balanceOfSellerAfter.toString());
  });
});
