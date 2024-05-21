// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {CollectionHelpers} from "@unique-nft/solidity-interfaces/contracts/CollectionHelpers.sol";
import {UniqueNFT, CollectionNestingAndPermission, CrossAddress, MintTokenData, Property} from "@unique-nft/solidity-interfaces/contracts/UniqueNFT.sol";

import {ConnectoNFTManagerState} from "./ConnectoNFTManagerState.sol";
import {TransferHelper} from "../common/TransferHelper.sol";

contract ConnectoNFTManager is ConnectoNFTManagerState, OwnableUpgradeable {
    using MessageHashUtils for bytes32;

    function initialize(
        address collectionHelper_,
        address connectoToken_,
        address treasuryWallet_,
        address signatureVerifier_,
        address defaultOwner_
    ) external initializer {
        __Ownable_init(defaultOwner_);
        _states.helpers = CollectionHelpers(collectionHelper_);
        _states.connectoToken = connectoToken_;
        _states.treasuryWallet = treasuryWallet_;
        _states.signatureVerifier = signatureVerifier_;
    }

    function createNFTCollection(
        address collectionOwner,
        uint256 connectoFeeAmount,
        string memory name,
        string memory description,
        string memory symbol,
        string calldata baseURI,
        string memory orderId,
        bytes memory signature
    ) public payable {
        /// cache the state
        ConnectoNFTManagerStateStorage memory _cachedStates = states();
        /// verify the signature
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            _cachedStates.signatureVerifier,
            keccak256(
                abi.encodePacked(orderId, connectoFeeAmount, _msgSender())
            ).toEthSignedMessageHash(),
            signature
        );
        if (!isValidSignature) {
            revert InvalidSignature();
        }
        setExecutedSig(signature);

        /// verify the Connecto fee
        TransferHelper.safeEnoughTokenApproved(
            _cachedStates.connectoToken,
            collectionOwner,
            address(this),
            connectoFeeAmount
        );
        TransferHelper.safeTransferFrom(
            _cachedStates.connectoToken,
            collectionOwner,
            _cachedStates.treasuryWallet,
            connectoFeeAmount
        );

        /// verify the Unique fee
        uint256 uniqueCollectionFee = _cachedStates
            .helpers
            .collectionCreationFee();
        if (msg.value < uniqueCollectionFee) {
            revert InsufficientAmount(msg.value, uniqueCollectionFee);
        }

        // create a collection using the method from the library
        address collectionAddress = _cachedStates.helpers.createNFTCollection{
            value: uniqueCollectionFee
        }(name, description, symbol);
        // make the collection ERC721Metadata compatible
        _cachedStates.helpers.makeCollectionERC721MetadataCompatible(
            collectionAddress,
            baseURI
        );
        // get the collection object by its address
        UniqueNFT collection = UniqueNFT(collectionAddress);
        // set the collection admin and owner using cross address
        collection.addCollectionAdminCross(CrossAddress(address(this), 0));
        collection.changeCollectionOwnerCross(CrossAddress(collectionOwner, 0));

        emit NewCollection(collectionOwner, collectionAddress);
    }

    function mintToCollection(
        address collectionAddr,
        address to,
        string memory orderId,
        bytes memory signature
    ) public payable {
        /// verify the signature
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            states().signatureVerifier,
            keccak256(
                abi.encodePacked(
                    "mintToCollection",
                    orderId,
                    collectionAddr,
                    _msgSender()
                )
            ).toEthSignedMessageHash(),
            signature
        );
        if (!isValidSignature) {
            revert InvalidSignature();
        }
        setExecutedSig(signature);

        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mint(to);
    }

    function mintCrossToCollection(
        address collectionAddr,
        CrossAddress memory to,
        Property[] memory properties,
        string memory orderId,
        bytes memory signature
    ) external {
        /// verify the signature
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            states().signatureVerifier,
            keccak256(
                abi.encodePacked(
                    "mintCrossToCollection",
                    orderId,
                    collectionAddr,
                    _msgSender()
                )
            ).toEthSignedMessageHash(),
            signature
        );
        if (!isValidSignature) {
            revert InvalidSignature();
        }
        setExecutedSig(signature);

        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mintCross(to, properties);
    }

    function mintBulkCrossToCollection(
        address collectionAddr,
        MintTokenData[] memory data,
        string memory orderId,
        bytes memory signature
    ) external {
        /// verify the signature
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            states().signatureVerifier,
            keccak256(
                abi.encodePacked(
                    "mintBulkCross",
                    orderId,
                    collectionAddr,
                    _msgSender()
                )
            ).toEthSignedMessageHash(),
            signature
        );
        if (!isValidSignature) {
            revert InvalidSignature();
        }
        setExecutedSig(signature);

        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mintBulkCross(data);
    }

    function exchangeToGift(
        address collectionAddr_,
        uint256[] calldata tokenIds_,
        string memory orderId,
        bytes memory signature
    ) external {
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            states().signatureVerifier,
            keccak256(
                abi.encodePacked(
                    "exchangeToGift",
                    orderId,
                    collectionAddr_,
                    _msgSender()
                )
            ).toEthSignedMessageHash(),
            signature
        );
        /// verify the signature
        if (!isValidSignature) {
            revert InvalidSignature();
        }
        setExecutedSig(signature);

        UniqueNFT collection = UniqueNFT(collectionAddr_);
        for (uint256 i = 0; i < tokenIds_.length; i++) {
            collection.burn(tokenIds_[i]);
        }

        emit ExchangeToGift(_msgSender(), collectionAddr_, tokenIds_);
    }

    /////////////////////////
    // setter function
    /////////////////////////
    function setTreasury(address treasury) public override onlyOwner {
        super.setTreasury(treasury);
    }

    function setSignatureVerifier(address verifier) public override onlyOwner {
        super.setSignatureVerifier(verifier);
    }

    /////////////////////////
    // view/pure function
    /////////////////////////
}
