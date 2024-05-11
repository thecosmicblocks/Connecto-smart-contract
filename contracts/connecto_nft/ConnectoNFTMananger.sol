// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
// CollectionHelpersEvents
import {CollectionHelpers} from "@unique-nft/solidity-interfaces/contracts/CollectionHelpers.sol";
import {UniqueNFT, CrossAddress, MintTokenData, Property} from "@unique-nft/solidity-interfaces/contracts/UniqueNFT.sol";

import {ConnectoNFTManagerState} from "./ConnectoNFTManagerState.sol";
import {TransferHelper} from "../common/TransferHelper.sol";

// CollectionHelpersEvents,
contract ConnectoNFTManager is ConnectoNFTManagerState, AccessControl {
    constructor(
        address defaultAdmin_,
        address collectionHelper_,
        address connectoToken_,
        address treasuryWallet_
    ) {
        _states.helpers = CollectionHelpers(collectionHelper_);
        _states.connectoToken = connectoToken_;
        _states.treasuryWallet = treasuryWallet_;
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin_);
    }

    function createCollection(
        address owner,
        address managerContract,
        string calldata name,
        string calldata description,
        string calldata symbol,
        string calldata baseURI
    ) public payable onlyRole(DEFAULT_ADMIN_ROLE) {
        ConnectoNFTManagerStateStorage memory _cachedStates = states();
        uint256 uniqueCollectionFee = _cachedStates
            .helpers
            .collectionCreationFee();
        if (msg.value < uniqueCollectionFee) {
            revert InsufficientAmount(msg.value, uniqueCollectionFee);
        }

        uint256 connectoFee = getConnectoFee();
        TransferHelper.safeEnoughTokenApproved(
            _cachedStates.connectoToken,
            owner,
            address(this),
            connectoFee
        );
        TransferHelper.safeTransferFrom(
            _cachedStates.connectoToken,
            owner,
            _cachedStates.treasuryWallet,
            connectoFee
        );

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
        collection.addCollectionAdminCross(CrossAddress(managerContract, 0));
        collection.changeCollectionOwnerCross(CrossAddress(owner, 0));

        emit NewCollection(owner, collectionAddress);
    }

    function mintToCollection(
        address collectionAddr,
        address to
    ) public payable {
        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mint(to);
    }

    function mintCrossToCollection(
        address collectionAddr,
        CrossAddress memory to,
        Property[] memory properties
    ) external {
        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mintCross(to, properties);
    }

    function mintBulkCrossToCollection(
        address collectionAddr,
        MintTokenData[] memory data
    ) external {
        UniqueNFT collection = UniqueNFT(collectionAddr);
        collection.mintBulkCross(data);
    }

    /////////////////////////
    // setter function
    /////////////////////////
    function setConnectoToken(
        address token
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _states.connectoToken = token;
    }

    function setTreasury(
        address treasury
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _states.treasuryWallet = treasury;
    }

    /////////////////////////
    // view/pure function
    /////////////////////////
    function getConnectoFee() public view returns (uint256) {
        // TODO: update the formula
        return 1_000_000_000_000; // 1 * 10**12
    }
}
