const Web3 = require("web3");
const readline = require("readline");

const contractAddress = "0x0d0ce23Ddb2EAc9439D2bA79f802016A60325B09";
const provider = "https://rpc.ankr.com/gnosis";
const web3 = new Web3(new Web3.providers.HttpProvider(provider));

const transfers = [
  { address: "0x123...", tokenId: "1" },
  { address: "0x456...", tokenId: "2" },
  // Add more if necessary
];

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const contract = new web3.eth.Contract(abi, contractAddress);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let account;
let privateKey;

rl.question("Enter your private key: ", async (key) => {
  privateKey = key;
  account = web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
  console.log(account.address);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  for (let i = 0; i < transfers.length; i++) {
    console.log(
      `Transferring token id ${transfers[i].tokenId} to address ${transfers[i].address}`
    );
    await transferToken(
      account.address,
      transfers[i].address,
      transfers[i].tokenId
    );
  }

  console.log("All transfers complete!");
  rl.close();
});

async function transferToken(from, to, tokenId) {
  const tx = contract.methods.transferFrom(from, to, tokenId);
  const gasEstimate = await tx.estimateGas({
    from: account.address,
  });

  const gas = Math.floor(gasEstimate * 1.5);
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(account.address);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce,
    },
    privateKey
  );

  await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
