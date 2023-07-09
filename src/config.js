import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";

// disconnect metamask wallet
export const disconnectWallet = () => {
  localStorage.removeItem("isWalletConnected");
  toast.info("Wallet disconnected");
};

// export const web3 = new Web3("https://rpc.ankr.com/eth");
export const web3 = new Web3("https://rpc.ankr.com/eth_goerli");

export const NFTAddress = "0xB08F70677aB92214f0a99F8A2b73a3BF773D17B8";
export const NFTABI = [
  {
    inputs: [{ internalType: "uint256", name: "_mintAmount", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "uint256",
        name: "weiAmount",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "whitelistedAddresses",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const readOnlyContract = new web3.eth.Contract(NFTABI, NFTAddress);

export const isWalletConnected = () => {
  if (localStorage.getItem("isWalletConnected") === "true") {
    return true;
  }

  return false;
};

export const connectWalletLocaly = () => {
  localStorage.setItem("isWalletConnected", true);
};
