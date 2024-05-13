// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

interface IConnecto {
    error InsufficientAmount(uint256 actualAmount, uint256 expectedAmount);
    error InvalidSignature();
    error InvalidValue();

    event NewCollection(address owner, address collectionAddress);

    function setTreasury(address treasury) external;

    function setSignatureVerifier(address verifier) external;
}
