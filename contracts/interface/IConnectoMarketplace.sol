// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "./IPlatformFee.sol";

interface IConnectoMarketplace is IPlatformFee {
    error ListingNotFound(uint256 listingId);
    error Forbidden(string reason);
    error InvalidSignature();

    /**
     *  @notice The two types of listings.
     *          `Direct`: NFTs listed for sale at a fixed price.
     *          `Auction`: NFTs listed for sale in an auction.
     */
    enum ListingType {
        Direct,
        Auction
    }

    /**
     *  @notice The information related to either (1) an offer on a direct listing, or (2) a bid in an auction.
     *
     *  @dev The type of the listing at ID `lisingId` determines how the `Offer` is interpreted.
     *      If the listing is of type `Direct`, the `Offer` is interpreted as an offer to a direct listing.
     *      If the listing is of type `Auction`, the `Offer` is interpreted as a bid in an auction.
     *
     *  @param listingId      The uid of the listing the offer is made to.
     *  @param offeror        The account making the offer.
     *                        This is the entire listing quantity if the listing is an auction.
     *  @param currency       The currency in which the offer is made.
     *  @param pricePerToken  The price per token offered to the lister.
     *  @param expirationTimestamp The timestamp after which a seller cannot accept this offer.
     */
    struct Offer {
        uint256 listingId;
        address offeror;
        uint256 pricePerToken;
        uint256 expirationTimestamp;
    }

    /**
     *  @notice The information related to a listing; either (1) a direct listing, or (2) an auction listing.
     *
     *  @dev For direct listings:
     *          (1) `reservePricePerToken` is ignored.
     *          (2) `buyoutPricePerToken` is simply interpreted as 'price per token'.
     *
     *  @param listingId             The uid for the listing.
     *
     *  @param tokenOwner            The owner of the tokens listed for sale.  
     *
     *  @param assetContract         The contract address of the NFT to list for sale.

     *  @param tokenId               The tokenId on `assetContract` of the NFT to list for sale.

     *  @param startTime             The unix timestamp after which the listing is active. For direct listings:
     *                               'active' means NFTs can be bought from the listing. For auctions,
     *                               'active' means bids can be made in the auction.
     *
     *  @param endTime               The timestamp after which the listing is inactive.
     *                               For direct listings: 'inactive' means NFTs cannot be bought from the listing.
     *                               For auctions: 'inactive' means bids can no longer be made in the auction.
     *
     *  @param quantity              The quantity of NFT of ID `tokenId` on the given `assetContract` listed. For
     *                               ERC 721 tokens to list for sale, the contract strictly defaults this to `1`,
     *                               Regardless of the value of `quantityToList` passed.
     *
     *  @param currency              For direct listings: the currency in which a buyer must pay the listing's fixed price
     *                               to buy the NFT(s). For auctions: the currency in which the bidders must make bids.
     *
     *  @param reservePricePerToken  For direct listings: this value is ignored. For auctions: the minimum bid amount of
     *                               the auction is `reservePricePerToken * quantityToList`
     *
     *  @param buyoutPricePerToken   For direct listings: interpreted as 'price per token' listed. For auctions: if
     *                               `buyoutPricePerToken` is greater than 0, and a bidder's bid is at least as great as
     *                               `buyoutPricePerToken * quantityToList`, the bidder wins the auction, and the auction
     *                               is closed.
     *
     *
     * @param listingType            The type of listing to create - a direct listing or an auction.
    **/
    struct Listing {
        uint256 listingId;
        address tokenOwner;
        address assetContract;
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        address currency;
        uint256 reservePricePerToken;
        uint256 buyoutPricePerToken;
        ListingType listingType;
    }

    /// @dev Emitted when a new listing is created.
    event ListingAdded(
        uint256 indexed listingId,
        address indexed assetContract,
        address indexed lister,
        Listing listing
    );

    /// @dev Emitted when the parameters of a listing are updated.
    event ListingUpdated(
        uint256 indexed listingId,
        address indexed listingCreator
    );

    /// @dev Emitted when a listing is cancelled.
    event ListingRemoved(
        uint256 indexed listingId,
        address indexed listingCreator
    );

    /**
     * @dev Emitted when a buyer buys from a direct listing, or a lister accepts some
     *      buyer's offer to their direct listing.
     */
    event NewSale(
        uint256 indexed listingId,
        address indexed assetContract,
        address indexed lister,
        address buyer,
        uint256 totalPricePaid
    );

    /// @dev Emitted when (1) a new offer is made to a direct listing, or (2) when a new bid is made in an auction.
    event NewOffer(
        uint256 indexed listingId,
        address indexed offeror,
        ListingType indexed listingType,
        uint256 totalOfferAmount,
        address currency
    );

    /// @dev Emitted when an auction is closed.
    event AuctionClosed(
        uint256 indexed listingId,
        address indexed closer,
        bool indexed cancelled,
        address auctionCreator,
        address winningBidder
    );

    /// @dev Emitted when auction buffers are updated.
    event AuctionBuffersUpdated(uint256 timeBuffer, uint256 bidBufferBps);

    function buy(
        Listing memory targetListing_,
        address buyFor_,
        bytes memory signature_
    ) external payable;

    function offer(
        Listing memory targetListing_,
        uint256 pricePerToken_,
        uint256 expirationTimestamp_
    ) external payable;

    function acceptOffer(
        Listing memory targetListing_,
        uint256 _listingId,
        address _offeror
    ) external;

    function closeAuction(
        Listing memory targetListing_,
        address _closeFor
    ) external;
}
