export const CONTRACT_KEY = {
  CONNECTO_TOKEN: "CONNECTO_TOKEN",
  CONNECTO_PROTOCOL: "CONNECTO_PROTOCOL",
  CONNECTO_PROTOCOL_IMPL: "CONNECTO_PROTOCOL_IMPL",
  CONNECTO_NFT_MANAGER: "CONNECTO_NFT_MANAGER",
  CONNECTO_NFT_MANAGER_IMPL: "CONNECTO_NFT_MANAGER_IMPL",
  CONNECTO_MARKETPLACE: "CONNECTO_MARKETPLACE",
  CONNECTO_MARKETPLACE_IMPL: "CONNECTO_MARKETPLACE_IMPL",
};

/// Type of tokens in collection
export const CollectionMode = {
  /// Nonfungible
  Nonfungible: 0,
  /// Fungible
  Fungible: 1,
  /// Refungible
  Refungible: 2,
};

export const COLLECTION_CONFIG = {
  // Set desired collection attributes
  collection: {
    collectionId: "", // you will get the collection id after the step 2-create-collection.js
    fileUrl:
      "https://ipfs.unique.network/ipfs/QmXkv9vg9NhZigdkC11oKEqnzSVxwxV5a5s7MmLxbe7Qri/", // link to IPFS, you will get it after the step 1-upload-images.js

    name: "Space Animals",
    description:
      "This collection is created to showcase the process of mass minting",
    // It is required that all NFT image names begin with the symbol, e.g. sa1.png, sa2.png ...
    symbol: "SA",

    customizableUrl: false, // set true only for the base customizable collection

    // To enable nesting set these properties:
    nesting: {
      tokenOwner: false,
      collectionAdmin: false,
    },
  },

  // Extra configuration
  weightSeparator: "%",
  desiredCount: 30, // How many NFTs to generate. Used only for 0-generate-nfts.js
  coverFileName: "cover.png", // Your cover should have this name. Save it in ./data folder
  numberOfTokensGeneratedAtOnce: 25,
  nestingUrl: "https://nesting.unique.network/common",
  imagesInParallel: require("os").cpus().length,
};

export const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const ListingType = {
  Direct: 0,
  Auction: 1,
};
