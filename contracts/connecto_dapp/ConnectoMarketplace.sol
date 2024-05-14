// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

//  ==========  Internal imports    ==========

import {IConnectoMarketplace} from "../interface/IConnectoMarketplace.sol";
import {TransferHelper} from "../common/TransferHelper.sol";
import {IERC2981} from "../interface/IERC2981.sol";

contract ConnectoMarketplace is
    IConnectoMarketplace,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using MessageHashUtils for bytes32;

    /*///////////////////////////////////////////////////////////////
                            State variables
    //////////////////////////////////////////////////////////////*/
    /// @dev Total number of listings ever created in the marketplace.
    uint256 public totalListings;

    /// @dev Contract level metadata.
    string public contractURI;

    /// @dev The address that receives all platform fees from all sales.
    address private platformFeeRecipient;

    /// @dev The max bps of the contract. So, 10_000 == 100 %
    uint64 public constant MAX_BPS = 10_000;

    /// @dev The % of primary sales collected as platform fees.
    uint64 private platformFeeBps;

    /// @dev
    /**
     *  @dev The amount of time added to an auction's 'endTime', if a bid is made within `timeBuffer`
     *       seconds of the existing `endTime`. Default: 15 minutes.
     */
    uint64 public timeBuffer;

    /// @dev The minimum % increase required from the previous winning bid. Default: 5%.
    uint64 public bidBufferBps;

    /*///////////////////////////////////////////////////////////////
                                Mappings
    //////////////////////////////////////////////////////////////*/

    /// @dev Mapping from uid of a direct listing => offeror address => offer made to the direct listing by the respective offeror.
    mapping(uint256 => mapping(address => Offer)) public offers;

    /// @dev Mapping from uid of an auction listing => current winning bid in an auction.
    mapping(uint256 => Offer) public winningBid;

    /// @dev Mapping from address of an account => balance of that account.
    mapping(address => mapping(address => uint256)) public returnBalance;

    /*///////////////////////////////////////////////////////////////
                    Constructor + initializer logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Initializes the contract, like a constructor.
    function initialize(
        address defaultOwner_,
        address platformFeeRecipient_,
        uint256 platformFeeBps_
    ) external initializer {
        // Initialize inherited contracts, most base-like -> most derived.
        __ReentrancyGuard_init();
        __Ownable_init(defaultOwner_);

        // Initialize this contract's state.
        timeBuffer = 15 minutes;
        bidBufferBps = 500;

        platformFeeBps = uint64(platformFeeBps_);
        platformFeeRecipient = platformFeeRecipient_;
    }

    /*///////////////////////////////////////////////////////////////
                        Generic contract logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets the contract receives native tokens from `nativeTokenWrapper` withdraw.
    receive() external payable {}

    /*///////////////////////////////////////////////////////////////
                    Direct lisitngs sales logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets an account buy a given quantity of tokens from a listing.
    function buy(
        Listing memory targetListing_,
        address buyFor_,
        bytes memory signature_
    ) external payable override nonReentrant {
        _validateListingSignature(targetListing_, signature_);
        executeSale(
            targetListing_,
            buyFor_,
            targetListing_.buyoutPricePerToken
        );
    }

    /// @dev Lets a listing's creator accept an offer for their direct listing.
    function acceptOffer(
        Listing memory targetListing_,
        uint256 _listingId,
        address _offeror
    ) external override nonReentrant {
        Offer memory targetOffer = offers[_listingId][_offeror];
        require(targetOffer.expirationTimestamp > block.timestamp, "EXPIRED");
        delete offers[_listingId][_offeror];
        executeSale(targetListing_, _offeror, targetOffer.pricePerToken);
    }

    /// @dev Performs a direct listing sale.
    function executeSale(
        Listing memory targetListing_,
        address receiver_,
        uint256 currencyAmountToTransfer_
    ) internal {
        validateDirectListingSale(targetListing_, currencyAmountToTransfer_);
        payout(
            targetListing_.tokenOwner,
            currencyAmountToTransfer_,
            targetListing_
        );
        IERC721(targetListing_.assetContract).safeTransferFrom(
            targetListing_.tokenOwner,
            receiver_,
            targetListing_.tokenId
        );
        emit NewSale(
            targetListing_.listingId,
            targetListing_.assetContract,
            targetListing_.tokenOwner,
            receiver_,
            currencyAmountToTransfer_
        );
    }

    /*///////////////////////////////////////////////////////////////
                        Offer/bid logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets an account (1) make an offer to a direct listing, or (2) make a bid in an auction.
    function offer(
        Listing memory targetListing_,
        uint256 pricePerToken_,
        uint256 expirationTimestamp_
    ) external payable override nonReentrant {
        if (
            !(targetListing_.endTime > block.timestamp &&
                targetListing_.startTime < block.timestamp)
        ) {
            revert Forbidden("inactive listing.");
        }
        // Both - (1) offers to direct listings, and (2) bids to auctions - share the same structure.
        Offer memory newOffer = Offer({
            listingId: targetListing_.listingId,
            offeror: _msgSender(),
            pricePerToken: pricePerToken_,
            expirationTimestamp: expirationTimestamp_
        });

        if (newOffer.pricePerToken == 0) {
            revert Forbidden("bidding zero amount");
        }
        // A bid must be made for all auction items.
        handleBid(targetListing_, newOffer);
    }

    /// @dev Processes a new offer to a direct listing.
    function handleOffer(
        Listing memory targetListing_,
        Offer memory newOffer_
    ) internal {
        validateBalanceOrAllowance(
            targetListing_.currency,
            newOffer_.pricePerToken
        );
        offers[targetListing_.listingId][newOffer_.offeror] = newOffer_;
        emit NewOffer(
            targetListing_.listingId,
            newOffer_.offeror,
            targetListing_.listingType,
            newOffer_.pricePerToken,
            targetListing_.currency
        );
    }

    /// @dev Processes an incoming bid in an auction.
    function handleBid(
        Listing memory targetListing_,
        Offer memory incomingBid_
    ) internal {
        Offer memory currentWinningBid = winningBid[targetListing_.listingId];
        uint256 currentOfferAmount = currentWinningBid.pricePerToken;
        uint256 incomingOfferAmount = incomingBid_.pricePerToken;
        // Close auction and execute sale if there's a buyout price and incoming offer amount is buyout price.
        if (
            targetListing_.buyoutPricePerToken > 0 &&
            incomingOfferAmount >= targetListing_.buyoutPricePerToken
        ) {
            _closeAuctionForBidder(targetListing_, incomingBid_);
        } else {
            /**
             *      If there's an existng winning bid, incoming bid amount must be bid buffer % greater.
             *      Else, bid amount must be at least as great as reserve price
             */
            require(
                isNewWinningBid(
                    targetListing_.reservePricePerToken,
                    currentOfferAmount,
                    incomingOfferAmount
                ),
                "not winning bid."
            );
            // Update the winning bid and listing's end time before external contract calls.
            winningBid[targetListing_.listingId] = incomingBid_;
        }
        // save balance for previous highest bid.
        if (currentWinningBid.offeror != address(0) && currentOfferAmount > 0) {
            returnBalance[currentWinningBid.offeror][
                targetListing_.currency
            ] += currentOfferAmount;
        }
        // Collect incoming bid
        validateBalanceOrAllowance(
            targetListing_.currency,
            incomingBid_.pricePerToken
        );
        emit NewOffer(
            targetListing_.listingId,
            incomingBid_.offeror,
            targetListing_.listingType,
            incomingBid_.pricePerToken,
            targetListing_.currency
        );
    }

    /// @dev Checks whether an incoming bid is the new current highest bid.
    function isNewWinningBid(
        uint256 _reserveAmount,
        uint256 _currentWinningBidAmount,
        uint256 _incomingBidAmount
    ) internal view returns (bool isValidNewBid) {
        if (_currentWinningBidAmount == 0) {
            isValidNewBid = _incomingBidAmount >= _reserveAmount;
        } else {
            isValidNewBid = (_incomingBidAmount > _currentWinningBidAmount &&
                ((_incomingBidAmount - _currentWinningBidAmount) * MAX_BPS) /
                    _currentWinningBidAmount >=
                bidBufferBps);
        }
    }

    /*///////////////////////////////////////////////////////////////
                    Auction lisitngs sales logic
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets an account close an auction for either the (1) winning bidder, or (2) auction creator.
    function closeAuction(
        Listing memory targetListing_,
        address closeFor_
    ) external override nonReentrant {
        if (targetListing_.listingType != ListingType.Auction) {
            revert Forbidden("not an auction.");
        }
        Offer memory targetBid = winningBid[targetListing_.listingId];
        // Cancel auction if (1) auction hasn't started, or (2) auction doesn't have any bids.
        bool toCancel = targetListing_.startTime > block.timestamp ||
            targetBid.offeror == address(0);
        if (toCancel) {
            // cancel auction listing owner check
            _cancelAuction(targetListing_);
        } else {
            require(
                targetListing_.endTime < block.timestamp,
                "cannot close auction before it has ended."
            );
            // No `else if` to let auction close in 1 tx when targetListing_.tokenOwner == targetBid.offeror.
            if (closeFor_ == targetListing_.tokenOwner) {
                _closeAuctionForAuctionCreator(targetListing_, targetBid);
            }
            if (closeFor_ == targetBid.offeror) {
                _closeAuctionForBidder(targetListing_, targetBid);
            }
        }
    }

    /// @dev Cancels an auction.
    function _cancelAuction(Listing memory targetListing_) internal {
        if (targetListing_.tokenOwner != _msgSender()) {
            revert Forbidden("caller is not the listing creator.");
        }
        emit AuctionClosed(
            targetListing_.listingId,
            _msgSender(),
            true,
            targetListing_.tokenOwner,
            address(0)
        );
    }

    /// @dev Closes an auction for an auction creator; distributes winning bid amount to auction creator.
    function _closeAuctionForAuctionCreator(
        Listing memory targetListing_,
        Offer memory winningBid_
    ) internal {
        uint256 payoutAmount = winningBid_.pricePerToken;
        winningBid_.pricePerToken = 0;
        winningBid[targetListing_.listingId] = winningBid_;

        payout(winningBid_.offeror, payoutAmount, targetListing_);

        emit AuctionClosed(
            targetListing_.listingId,
            _msgSender(),
            false,
            targetListing_.tokenOwner,
            winningBid_.offeror
        );
    }

    /// @dev Closes an auction for the winning bidder; distributes auction items to the winning bidder.
    function _closeAuctionForBidder(
        Listing memory targetListing_,
        Offer memory winningBid_
    ) internal {
        winningBid[targetListing_.listingId] = winningBid_;
        IERC721(targetListing_.assetContract).transferFrom(
            targetListing_.tokenOwner,
            winningBid_.offeror,
            targetListing_.tokenId
        );

        emit AuctionClosed(
            targetListing_.listingId,
            _msgSender(),
            false,
            targetListing_.tokenOwner,
            winningBid_.offeror
        );
    }

    /// @dev Pays out stakeholders in a sale.
    function payout(
        address payee_,
        uint256 totalPayoutAmount_,
        Listing memory targetListing_
    ) internal {
        uint256 platformFeeCut = (totalPayoutAmount_ * platformFeeBps) /
            MAX_BPS;
        uint256 royaltyCut;
        address royaltyRecipient;
        // Distribute royalties. See Sushiswap's https://github.com/sushiswap/shoyu/blob/master/contracts/base/BaseExchange.sol#L296
        try
            IERC2981(targetListing_.assetContract).royaltyInfo(
                targetListing_.tokenId,
                totalPayoutAmount_
            )
        returns (address royaltyFeeRecipient, uint256 royaltyFeeAmount) {
            if (royaltyFeeRecipient != address(0) && royaltyFeeAmount > 0) {
                require(
                    royaltyFeeAmount + platformFeeCut <= totalPayoutAmount_,
                    "fees exceed the price"
                );
                royaltyRecipient = royaltyFeeRecipient;
                royaltyCut = royaltyFeeAmount;
            }
        } catch {}
        // Distribute price to token owner
        returnBalance[platformFeeRecipient][
            targetListing_.currency
        ] += platformFeeCut;
        returnBalance[royaltyRecipient][targetListing_.currency] += royaltyCut;
        returnBalance[payee_][targetListing_.currency] +=
            totalPayoutAmount_ -
            (platformFeeCut + royaltyCut);
    }

    /// @dev Validates that `_tokenOwner` owns and has approved Market to transfer NFTs.
    function validateOwnershipAndApproval(
        address _tokenOwner,
        address _assetContract,
        uint256 _tokenId
    ) internal view {
        address market = address(this);
        bool isValid;

        isValid =
            IERC721(_assetContract).ownerOf(_tokenId) == _tokenOwner &&
            (IERC721(_assetContract).getApproved(_tokenId) == market ||
                IERC721(_assetContract).isApprovedForAll(_tokenOwner, market));
        if (!isValid) {
            revert Forbidden("Invalid Ownership or Approval");
        }
    }

    /// @dev Validates conditions of a direct listing sale.
    function validateDirectListingSale(
        Listing memory listing_,
        uint256 settledTotalPrice_
    ) internal {
        if (listing_.listingType != ListingType.Direct) {
            revert Forbidden("cannot buy from listing");
        }

        // Check if sale is made within the listing window.
        if (
            !(block.timestamp < listing_.endTime &&
                block.timestamp > listing_.startTime)
        ) {
            revert Forbidden("not within sale window.");
        }

        // Check: buyer owns and has approved sufficient currency for sale.
        validateBalanceOrAllowance(listing_.currency, settledTotalPrice_);

        // Check whether token owner owns and has approved `quantityToBuy` amount of listing tokens from the listing.
        validateOwnershipAndApproval(
            listing_.tokenOwner,
            listing_.assetContract,
            listing_.tokenId
        );
    }

    function claim(address to_, address token_) external {
        uint256 payoutAmount = returnBalance[_msgSender()][token_];
        if (payoutAmount == 0) {
            revert Forbidden("No funds to claim");
        }
        transferToken(token_, to_, payoutAmount);
    }

    function transferToken(
        address currency_,
        address to_,
        uint256 amount
    ) internal {
        if (currency_ == TransferHelper.NATIVE_TOKEN) {
            (bool isSuccess, ) = to_.call{value: amount}("");
            require(isSuccess, "TransferFailed");
        } else {
            TransferHelper.safeTransfer(currency_, to_, amount);
        }
    }

    function validateBalanceOrAllowance(
        address currency_,
        uint256 amount_
    ) internal {
        if (currency_ == TransferHelper.NATIVE_TOKEN) {
            require(msg.value == amount_, "msg.value != price");
        } else {
            TransferHelper.safeEnoughTokenApproved(
                currency_,
                _msgSender(),
                address(this),
                amount_
            );
            TransferHelper.safeTransferFrom(
                currency_,
                _msgSender(),
                address(this),
                amount_
            );
        }
    }

    /*///////////////////////////////////////////////////////////////
                            Getter functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Returns the platform fee recipient and bps.
    function getPlatformFeeInfo() external view returns (address, uint16) {
        return (platformFeeRecipient, uint16(platformFeeBps));
    }

    /*///////////////////////////////////////////////////////////////
                            Setter functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Lets a contract admin update platform fee recipient and bps.
    function setPlatformFeeInfo(
        address _platformFeeRecipient,
        uint256 _platformFeeBps
    ) external onlyOwner {
        require(_platformFeeBps <= MAX_BPS, "bps <= 10000.");

        platformFeeBps = uint64(_platformFeeBps);
        platformFeeRecipient = _platformFeeRecipient;

        emit PlatformFeeInfoUpdated(_platformFeeRecipient, _platformFeeBps);
    }

    /// @dev Lets a contract admin set auction buffers.
    function setAuctionBuffers(
        uint256 _timeBuffer,
        uint256 _bidBufferBps
    ) external onlyOwner {
        require(_bidBufferBps < MAX_BPS, "invalid BPS.");

        timeBuffer = uint64(_timeBuffer);
        bidBufferBps = uint64(_bidBufferBps);

        emit AuctionBuffersUpdated(_timeBuffer, _bidBufferBps);
    }

    /*///////////////////////////////////////////////////////////////
                            Miscellaneous
    //////////////////////////////////////////////////////////////*/

    function _validateListingSignature(
        Listing memory request_,
        bytes memory signature_
    ) internal view {
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            request_.tokenOwner,
            keccak256(
                abi.encodePacked(
                    request_.listingId,
                    request_.assetContract,
                    request_.tokenOwner,
                    request_.tokenId,
                    request_.startTime,
                    request_.endTime,
                    request_.currency,
                    request_.reservePricePerToken,
                    request_.buyoutPricePerToken,
                    request_.listingType
                )
            ).toEthSignedMessageHash(),
            signature_
        );

        if (!isValidSignature) {
            revert InvalidSignature();
        }
    }
}
