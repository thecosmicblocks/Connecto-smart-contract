// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MyERC721 is ERC721Enumerable {
    constructor() ERC721("MyERC721", "MyERC721") {}

    function mint(address to) public {
        _safeMint(to, totalSupply());
    }
}
