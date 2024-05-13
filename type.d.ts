import { BigNumberish, BytesLike } from "ethers";

export type ValueOf<T> = T[keyof T];

export type CollectionFlags = BigNumberish;

export type CollectionMode =
  | 0 /// Nonfungible
  | 1 /// Fungible
  | 2; /// Refungible

export interface Property {
  key: string;
  value: BytesLike;
}

export type TokenPermissionField =
  /// Permission to change the property and property permission. See [`up_data_structs::PropertyPermission::mutable`]
  | 0 /// Mutable
  /// Change permission for the collection administrator. See [`up_data_structs::PropertyPermission::token_owner`]
  | 1 /// TokenOwner
  /// Permission to change the property for the owner of the token. See [`up_data_structs::PropertyPermission::collection_admin`]
  | 2; /// CollectionAdmin

export interface PropertyPermission {
  /// TokenPermission field.
  code: TokenPermissionField;
  /// TokenPermission value.
  value: boolean;
}

export interface TokenPropertyPermission {
  /// Token property key.
  key: string;
  /// Token property permissions.
  permissions: PropertyPermission[];
}

export interface CrossAddress {
  eth: string;
  sub: BigNumberish;
}

export interface CollectionNestingAndPermission {
  /// Owner of token can nest tokens under it.
  token_owner: boolean;
  /// Admin of token collection can nest tokens under token.
  collection_admin: boolean;
  /// If set - only tokens from specified collections can be nested.
  restricted: string[];
}

export type CollectionLimitField =
  /// How many tokens can a user have on one account.
  | 0 /// AccountTokenOwnership,
  /// How many bytes of data are available for sponsorship.
  | 1 ///  SponsoredDataSize,
  /// In any case, chain default: [`SponsoringRateLimit::SponsoringDisabled`]
  | 2 ///  SponsoredDataRateLimit,
  /// How many tokens can be mined into this collection.
  | 3 ///  TokenLimit,
  /// Timeouts for transfer sponsoring.
  | 4 ///  SponsorTransferTimeout,
  /// Timeout for sponsoring an approval in passed blocks.
  | 5 ///  SponsorApproveTimeout,
  /// Whether the collection owner of the collection can send tokens (which belong to other users).
  | 6 ///  OwnerCanTransfer,
  /// Can the collection owner burn other people's tokens.
  | 7 ///  OwnerCanDestroy,
  /// Is it possible to send tokens from this collection between users.
  | 8; ///  TransferEnabled

export interface CollectionLimitValue {
  field: CollectionLimitField;
  value: BigNumberish;
}

/// Collection properties
export interface CreateCollectionData {
  /// Collection name
  name: string;
  /// Collection description
  description: string;
  /// Token prefix
  token_prefix: string;
  /// Token type (NFT, FT or RFT)
  mode: CollectionMode;
  /// Fungible token precision
  decimals: BigNumberish;
  /// Custom Properties
  properties: Property[];
  /// Permissions for token properties
  token_property_permissions: TokenPropertyPermission[];
  /// Collection admins
  admin_list: CrossAddress[];
  /// Nesting settings
  nesting_settings: CollectionNestingAndPermission;
  /// Collection limits
  limits: CollectionLimitValue[];
  /// Collection sponsor
  pending_sponsor: CrossAddress;
  /// Extra collection flags
  flags: CollectionFlags;
}

export interface Listing {
  listingId: BigNumberish;
  tokenOwner: string;
  assetContract: string;
  tokenId: BigNumberish;
  startTime: BigNumberish;
  endTime: BigNumberish;
  currency: string;
  reservePricePerToken: BigNumberish;
  buyoutPricePerToken: BigNumberish;
  listingType: BigNumberish;
}
