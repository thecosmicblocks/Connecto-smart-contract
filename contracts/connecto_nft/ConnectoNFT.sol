// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract ConnectoNFT is ERC721Enumerable, AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
    string __baseUri;

    constructor(
        address defaultAdmin_,
        address connectoNftManager,
        string memory name,
        string memory symbol,
        string memory baseUri_
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin_);
        _grantRole(OPERATOR_ROLE, connectoNftManager);
        __baseUri = baseUri_;
    }

    function _baseURI() internal view override returns (string memory) {
        return __baseUri;
    }

    function mint(address to) external onlyRole(OPERATOR_ROLE) {
        _mint(to, totalSupply());
    }

    function mintBulk(
        address to,
        uint256 amount
    ) external onlyRole(OPERATOR_ROLE) {
        for (uint256 i = 0; i < amount; i++) {
            _mint(to, totalSupply());
        }
    }

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControl, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
