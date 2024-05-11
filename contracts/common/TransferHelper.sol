//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TransferHelper {
    function safeApprove(address token, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x095ea7b3, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "TransferHelper::safeApprove: approve failed"
        );
    }

    function safeTransfer(address token, address to, uint256 value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "TransferHelper::safeTransfer: transfer failed"
        );
    }

    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "TransferHelper::transferFrom: transferFrom failed"
        );
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
        require(
            success && (abi.decode(data, (uint256)) >= amount),
            "Exchange currency allowance of user is too low"
        );
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
        require(
            success && (abi.decode(data, (uint256)) >= amount),
            "Exchange currency balance of user is too low"
        );
    }
}
