import React, { useState, useEffect } from "react";
import { ModalContext } from "./ModalContext";
import {
  connectWalletLocaly,
  isWalletConnected,
  disconnectWallet,
} from "../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import Web3Modal from "web3modal";
// import WalletConnectProvider from "@walletconnect/web3-provider"; // deprecated
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { NFTAddress, NFTABI } from "../config";
import { createUser } from "../util/api.js";

const activeChain = 5;

const WalletContext = ({ children }) => {
  const INFURA_ID = process.env.REACT_APP_INFURA_ID;
  // const PROJECT_ID = process.env.REACT_APP_PROJECT_ID;

  const providerOptions = {
    walletconnect: {
      // package: WalletConnectProvider, // required
      package: EthereumProvider, // required
      options: {
        rpc: {
          1: "https://mainnet.infura.io/v3/" + INFURA_ID,
          5: "https://rpc.ankr.com/eth_goerli",
          137: "https://matic-mainnet.chainstacklabs.com",
        },
        infuraId: INFURA_ID, // required
        chainId: activeChain,
      },
    },
  };

  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const [account, setAccount] = useState(undefined);
  const [user, setUser] = useState(undefined); // [address, balance
  const [web3api, setWeb3api] = useState(undefined);
  const [userBalance, setUserBalance] = useState(undefined);
  const [NFTContract, setNFTContract] = useState(undefined);

  // Uncomment this for only using the Wallet Connect UI
  // const [providerClient, setProviderClient] = useState(undefined);
  // useEffect(() => {
  //   onInitializeProviderClient();
  // }, []);

  // async function onInitializeProviderClient() {
  //   const client = await EthereumProvider.init({
  //     projectId: PROJECT_ID,
  //     showQrModal: true,
  //     qrModalOptions: { themeMode: "dark" },
  //     chains: [1],
  //     methods: ["eth_sendTransaction", "personal_sign"],
  //     events: ["chainChanged", "accountsChanged"],
  //   });
  //   setProviderClient(client);
  // }

  const connectWalletModalHandle = () => {
    if (!isWalletConnected()) {
      setConnectWalletModal(!connectWalletModal);
    }
  };

  const connectWallet = async () => {
    const loadingToast = toast.loading("Connecting to wallet...");
    // await providerClient.connect();
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
      theme: "dark",
    });
    await web3Modal
      .connect()
      .then(async (provider) => {
        const web3 = new Web3(provider);
        setWeb3api(web3);
        const mintingContract = new web3.eth.Contract(NFTABI, NFTAddress);
        setNFTContract(mintingContract);
        let accounts = await web3.eth.getAccounts();
        accounts = accounts.map((account) => {
          return web3.utils.toChecksumAddress(account);
        });
        const balance = await web3.eth.getBalance(accounts[0]);
        setUserBalance(Web3.utils.fromWei(balance, "ether"));
        //save in local storage
        if (!isWalletConnected()) {
          connectWalletLocaly();
        }
        const { data } = await createUser({
          address: accounts[0],
        });
        const user = {
          wallets: accounts,
          points: data.points,
          tickets: data.tickets,
          isAdmin: data.isAdmin,
        };
        toast.dismiss(loadingToast);
        setUser(user);
        setAccount(accounts);
        toast.success("Wallet connected");
        return accounts;
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("User closed modal");
      });
  };

  const accountChangedHandler = (accounts) => {
    if (isWalletConnected() && accounts.length > 0) {
      toast.info("Account change detected");
    }

    if (accounts.length > 0) {
      createUser({
        address: accounts[0],
      })
        .then(({ data }) => {
          const user = {
            wallets: accounts,
            points: data.points,
            tickets: data.tickets,
            isAdmin: data.isAdmin,
          };
          setUser(user);
          setAccount(accounts);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      disconnectWalletFromApp();
    }
  };

  // const chainChangedHandler = () => {
  //   window.ethereum.request({
  //     method: "wallet_switchEthereumChain",
  //     params: [{ chainId: `0x${activeChain}` }],
  //   });
  // };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accountChangedHandler);
      // window.ethereum.on("chainChanged", chainChangedHandler);
    }
  }, []);

  const isWalletAlreadyConnected = async () => {
    if (isWalletConnected()) {
      const accounts = await connectWallet();
      setAccount(accounts);
    }
  };

  const getWalletAddress = () => {
    return account ? account : undefined;
  };

  const disconnectWalletFromApp = () => {
    disconnectWallet();
    setAccount(undefined);
  };

  return (
    <ModalContext.Provider
      value={{
        account,
        user,
        userBalance,
        web3api,
        NFTContract,
        isWalletAlreadyConnected,
        getWalletAddress,
        disconnectWalletFromApp,
        connectWalletModalHandle,
        connectWallet,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default WalletContext;
