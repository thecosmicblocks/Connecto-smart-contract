//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "hardhat/console.sol";

library TransferHelper {
    error ApproveFailed();
    error TransferFailed();
    error InsufficientAllowance();
    error InsufficientBalance();

    /// @dev The address interpreted as native token of the chain.
    address public constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    function safeApprove(address token, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x095ea7b3, to, value)
        );
        if (!(success && (data.length == 0 || abi.decode(data, (bool))))) {
            revert ApproveFailed();
        }
    }

    function safeTransfer(address token, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        if (!(success && (data.length == 0 || abi.decode(data, (bool))))) {
            revert TransferFailed();
        }
    }

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        console.log("transferFrom");
        console.log(from);
        console.log("transferFrom to");
        console.log(to);

        console.log(msg.sender);
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, value)
        );
        if (!(success && (data.length == 0 || abi.decode(data, (bool))))) {
            revert TransferFailed();
        }
    }

    function safeEnoughTokenApproved(
        address token,
        address owner,
        address spender,
        uint256 amount
    ) internal {
        // bytes4(keccak256(bytes('allowance(address,address)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xdd62ed3e, owner, spender)
        );
        if (!(success && (abi.decode(data, (uint256)) >= amount))) {
            revert InsufficientAllowance();
        }
    }

    function safeEnoughBalance(
        address token,
        address owner,
        uint256 amount
    ) internal {
        // bytes4(keccak256(bytes('blanceOf(address)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x70a08231, owner)
        );
        console.log("==========");
        console.log(abi.decode(data, (uint256)));
        if (!(success && (abi.decode(data, (uint256)) >= amount))) {
            revert InsufficientBalance();
        }
    }
}
