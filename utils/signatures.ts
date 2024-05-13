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
