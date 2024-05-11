// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {IConnecto} from "../interface/IConnecto.sol";
import {CollectionHelpers} from "@unique-nft/solidity-interfaces/contracts/CollectionHelpers.sol";

abstract contract ConnectoNFTManagerState is IConnecto {
    struct ConnectoNFTManagerStateStorage {
        CollectionHelpers helpers;
        address connectoToken;
        address treasuryWallet;
    }

    ConnectoNFTManagerStateStorage _states;

    function states()
        internal
        view
        returns (ConnectoNFTManagerStateStorage memory)
    {
        return _states;
    }
}
