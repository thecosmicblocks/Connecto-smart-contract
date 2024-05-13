// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {Initializable, OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {TransferHelper} from "../common/TransferHelper.sol";

contract ConnectoProtocol is OwnableUpgradeable {
    address public feeCollector;
    uint256 public feePercentage;
    mapping(address => mapping(address => uint256)) public claimableAmount;

    error InvalidAmount(uint256 amount);
    error TransferFailed(uint256 amount);
    event Donated(address sender, address idol, address token, uint256 amount);

    function initialize(
        address defaultOwner_,
        address feeCollector_,
        uint256 feePercentage_
    ) public initializer {
        __Ownable_init(defaultOwner_);
        feeCollector = feeCollector_;
        feePercentage = feePercentage_;
    }

    function donate(address idol, address token, uint256 amount) external {
        // Calculate fee
        uint256 fee = (amount * feePercentage) / 10_000;
        uint256 netAmount = amount - fee;
        address collector = feeCollector;

        // save data
        claimableAmount[collector][token] =
            claimableAmount[collector][token] +
            fee;
        claimableAmount[idol][token] = claimableAmount[idol][token] + netAmount;

        emit Donated(_msgSender(), idol, token, amount);
    }

    function claim(address token) external {
        address caller = _msgSender();
        uint256 balance = claimableAmount[caller][token];
        if (balance == 0) {
            revert InvalidAmount(balance);
        }
        claimableAmount[caller][token] = 0;
        if (token == address(0)) {
            (bool isSucceeded, ) = msg.sender.call{value: balance}("");
            if (!isSucceeded) {
                revert TransferFailed(balance);
            }
        } else {
            TransferHelper.safeTransfer(token, caller, balance);
        }
    }
}
