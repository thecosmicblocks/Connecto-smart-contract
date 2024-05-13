import { ethers } from "hardhat";
import { COLLECTION_CONFIG, CollectionMode } from "../constants";

export const getCollectionData = (adminAddress: string[]) => {
  const collectionData = {
    name: COLLECTION_CONFIG.collection.name,
    description: COLLECTION_CONFIG.collection.description,
    token_prefix: COLLECTION_CONFIG.collection.symbol,
    mode: CollectionMode.Nonfungible,
    decimals: 1,
    properties: [],
    token_property_permissions: [
      // {
      //   key: string;
      //   permissions: { code: BigNumberish; value: boolean }[];
      // }
    ],
    admin_list: adminAddress.map((adminAddr) => ({
      eth: ethers.utils.getAddress(adminAddr),
      sub: 0,
    })),
    nesting_settings: {
      token_owner: true,
      collection_admin: true,
      restricted: [],
    },
    limits: [
      // { field: BigNumberish; value: BigNumberish }
    ],
    pending_sponsor: { eth: ethers.constants.AddressZero, sub: 0 },
    flags: 0,
  };
  return collectionData;
};
