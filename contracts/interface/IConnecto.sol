// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

interface IConnecto {
    error InsufficientAmount(uint256 actualAmount, uint256 expectedAmount);
    error TransferFailed();
    error Forbidden(string message);

    event NewCollection(address owner, address collectionAddress);

    function setConnectoToken(address token_) external;
}
