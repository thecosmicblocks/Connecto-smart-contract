// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract ConnectoToken is ERC20Upgradeable {
    function initialize(
        string memory name_,
        string memory symbol_
    ) public initializer {
        __ERC20_init(name_, symbol_);
    }

    /// @dev for testnet only
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
