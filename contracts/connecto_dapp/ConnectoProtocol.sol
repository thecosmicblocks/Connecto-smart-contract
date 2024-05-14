// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {TransferHelper} from "../common/TransferHelper.sol";

contract ConnectoProtocol is OwnableUpgradeable {
    address public feeCollector;
    uint256 public feePercentage;
    mapping(address => mapping(address => uint256)) public claimableAmount;

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

    function donate(
        address idol,
        address token,
        uint256 amount
    ) external payable {
        require(amount > 0, "Zero amount");
        if (token == TransferHelper.NATIVE_TOKEN) {
            require(msg.value >= amount, "Invalid amount");
        } else {
            TransferHelper.safeTransferFrom(
                token,
                _msgSender(),
                address(this),
                amount
            );
        }

        // Calculate fee
        uint256 fee = (amount * feePercentage) / 10_000;
        uint256 netAmount = amount - fee;

        // save data
        claimableAmount[feeCollector][token] += fee;
        claimableAmount[idol][token] += netAmount;

        emit Donated(_msgSender(), idol, token, amount);
    }

    function claim(address token) external {
        address caller = _msgSender();
        uint256 balance = claimableAmount[caller][token];
        require(balance > 0, "Zero balance");
        claimableAmount[caller][token] = 0;
        if (token == TransferHelper.NATIVE_TOKEN) {
            (bool isSucceeded, ) = msg.sender.call{value: balance}("");
            require(isSucceeded, "TransferFailed");
        } else {
            TransferHelper.safeTransfer(token, caller, balance);
        }
    }
}
