import { Listing } from "./../type.d";
import { BigNumberish } from "ethers";
import { Bytes, arrayify, solidityKeccak256 } from "ethers/lib/utils";

type MsgSigner = { signMessage: (message: Bytes | string) => Promise<string> };

export const getCreateCollectionSignature = (
  signer: MsgSigner,
  orderHash: string,
  connectoFeeAmount: BigNumberish,
  sender: string
): Promise<string> => {
  const msg = solidityKeccak256(
    ["string", "uint256", "address"],
    [orderHash, connectoFeeAmount, sender]
  );
  return signer.signMessage(arrayify(msg));
};

export const getMintSignature = (
  signer: MsgSigner,
  fnName:
    | "mintToCollection"
    | "mintCrossToCollection"
    | "mintBulkCrossToCollection",
  orderHash: string,
  collectionAddr: string,
  sender: string
): Promise<string> => {
  const msg = solidityKeccak256(
    ["string", "string", "address", "address"],
    [fnName, orderHash, collectionAddr, sender]
  );
  return signer.signMessage(arrayify(msg));
};

export const getExchangeNftSignature = (
  signer: MsgSigner,
  orderHash: string,
  collectionAddr: string,
  sender: string
): Promise<string> => {
  const msg = solidityKeccak256(
    ["string", "string", "address", "address"],
    ["exchangeToGift", orderHash, collectionAddr, sender]
  );
  return signer.signMessage(arrayify(msg));
};

export const getListingSignature = (
  signer: MsgSigner,
  listingData: Listing
) => {
  const msg = solidityKeccak256(
    [
      "uint256",
      "address",
      "address",
      "uint256",
      "uint256",
      "uint256",
      "address",
      "uint256",
      "uint256",
      "uint8",
    ],
    [
      listingData.listingId,
      listingData.assetContract,
      listingData.tokenOwner,
      listingData.tokenId,
      listingData.startTime,
      listingData.endTime,
      listingData.currency,
      listingData.reservePricePerToken,
      listingData.buyoutPricePerToken,
      listingData.listingType,
    ]
  );
  return signer.signMessage(arrayify(msg));
};
