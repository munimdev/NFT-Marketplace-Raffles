import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createRaffle } from "../util/api.js";
import { toast } from "react-toastify";
import {
  getAllRaffles,
  raffleHistory,
  searchUser,
  banUser,
  unbanUser,
  addPoints,
} from "../util/api";
import Web3 from "web3";

const AdminDashboard = () => {
  const [raffles, setRaffles] = React.useState([]);
  const [raffleModal, setRaffleModal] = React.useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [nftData, setNftData] = React.useState(null);
  const [userAddress, setUserAddress] = React.useState("");
  const [userModal, setUserModal] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [userPoints, setUserPoints] = React.useState(0);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const { data } = await getAllRaffles();
        let raffles = data;

        const history = await raffleHistory();
        raffles = raffles.map((raffle) => {
          return {
            ...raffle,
            history: history[raffle._id],
          };
        });
        setRaffles(raffles);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchRaffles();
  }, []);

  const handleOpen = () => setRaffleModal(true);
  const handleClose = () => setRaffleModal(false);

  const handleCreate = async () => {
    const loadingToast = toast.loading("Creating raffle...");
    try {
      const res = await createRaffle(nftData);
      console.log(res);
      toast.success(res.message);
      setRaffleModal(false);
      setNftData(null);
      setRaffles([...raffles, { ...res.data, history: [] }]);
    } catch (err) {
      // console.log(err);
      // console.log(err.response);
      if (err.response !== undefined) toast.error(err.response.data.message);
      else toast.error("Something went wrong while creating a raffle");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleSearch = async () => {
    if (!Web3.utils.isAddress(userAddress)) {
      return toast.error("Invalid address.");
    }

    const loadingToast = toast.loading("Searching user...");

    try {
      const res = await searchUser({
        address: Web3.utils.toChecksumAddress(userAddress),
      });
      console.log(res);
      toast.success(res.message);
      let flattenedHistory = res.data.user.history.flatMap((item) =>
        item.purchases.map((purchase) => ({
          raffleName: item.raffleName + " #" + item.tokenId,
          purchase: {
            amount: purchase.amount,
            purchasedAt: purchase.purchasedAt,
          },
        }))
      );

      flattenedHistory.sort(
        (a, b) =>
          new Date(b.purchase.purchasedAt) - new Date(a.purchase.purchasedAt)
      );
      // setUserData(res.data);
      setUserData({
        ...res.data,
        history: flattenedHistory,
      });
      setUserModal(true);
    } catch (err) {
      console.log(err);
      if (err.response !== undefined) toast.error(err.response.data.message);
      else toast.error("Something went wrong while searching user");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleAddPoints = async () => {
    if (!Web3.utils.isAddress(userAddress)) {
      return toast.error("Invalid address.");
    }

    const loadingToast = toast.loading("Adding points...");

    try {
      const res = await addPoints({
        address: Web3.utils.toChecksumAddress(userAddress),
        points: userPoints,
      });

      console.log(res.data.points);

      toast.success(res.message);
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          points: res.data.points,
        },
      });
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong while adding points");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleBan = async () => {
    if (!Web3.utils.isAddress(userAddress)) {
      return toast.error("Invalid address.");
    }

    const loadingToast = toast.loading(
      `${userData.user.banned ? "Unbanning" : "Banning"} user...`
    );

    try {
      const res = await (userData.user.banned ? unbanUser : banUser)({
        address: Web3.utils.toChecksumAddress(userAddress),
      });

      toast.success(res.message);
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          banned: !userData.user.banned,
        },
      });
    } catch (err) {
      console.log(err);
      toast.error(
        `Something went wrong while ${
          userData.user.banned ? "unbanning" : "banning"
        } user`
      );
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const fetchNftData = async () => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.REACT_APP_OPENSEA_API_KEY,
      },
    };

    try {
      const res = await fetch(
        `https://api.opensea.io/v2/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`,
        options
      );

      const data = await res.json();
      console.log(data);
      // setNftData({
      //   ...data.nft,
      //   image_url: data.nft.image_url.replace("w=500", "w=750"),
      // });
      const traits = data.nft.traits.reduce((acc, trait) => {
        // save  only the trait_type, value and trait_ count
        acc.push({
          trait_type: trait.trait_type,
          value: trait.value,
          trait_count: trait.trait_count,
        });
        return acc;
      }, []);

      setNftData({
        item: {
          contractAddress: data.nft.contract,
          tokenId: data.nft.identifier,
          name: data.nft.collection.replace(/\b\w/g, (char) =>
            char.toUpperCase()
          ),
          description: data.nft.description,
          image: data.nft.image_url.replace("w=500", "w=750"),
          traits: traits,
          links: {
            opensea: `https://opensea.io/assets/ethereum/${data.nft.contract}/${data.nft.identifier}`,
            etherscan: `https://etherscan.io/token/${data.nft.contract}?a=${data.nft.identifier}`,
            twitter: null,
            discord: null,
            website: null,
          },
        },
        maxTickets: "",
        price: "",
        expiry: Math.floor(Date.now() / 1000),
      });
    } catch (err) {
      toast.error("Something went wrong while fetching NFT data");
    }
  };

  return (
    <div className="container max-w-5xl mt-20">
      <div className="flex flex-row items-center justify-center w-full">
        <button
          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
          onClick={() => handleOpen(true)}
        >
          Add Raffle
        </button>
        <Transition
          appear
          show={raffleModal}
          as={Fragment}
          className="sm:my-40"
        >
          <Dialog as="div" className="relative z-10" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full p-4 my-auto text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel
                    className="w-full max-w-6xl p-6 overflow-hidden overflow-y-scroll text-left align-middle transition-all transform shadow-xl bg-secondary rounded-2xl"
                    style={{
                      height: "60dvh",
                    }}
                  >
                    <div
                      className="absolute z-10 p-1 rounded-full cursor-pointer top-2 right-2 "
                      onClick={handleClose}
                    >
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      {/* Create form with 2 fields. One should be the contract address, other token ID, and below that a submit/fetch button */}
                      <div className="flex flex-col self-center w-2/3">
                        <label className="mb-2 text-base font-medium text-center text-text">
                          Contract Address
                        </label>
                        <input
                          value={contractAddress}
                          onChange={(e) => setContractAddress(e.target.value)}
                          placeholder="Contract Address"
                          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                        />

                        <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                          Token ID
                        </label>
                        <input
                          value={tokenId}
                          onChange={(e) => setTokenId(e.target.value)}
                          placeholder="Token ID"
                          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                        />

                        <button
                          className="px-4 py-2 mt-4 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
                          onClick={fetchNftData}
                        >
                          Fetch
                        </button>

                        {nftData && (
                          <Fragment>
                            <hr className="w-full my-8 border-gray-600" />
                            <div className="flex gap-5">
                              <div className="flex flex-col w-1/2">
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Collection Name
                                </label>
                                <input
                                  value={nftData.item.name}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        name: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Collection Name"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Token ID
                                </label>
                                <input
                                  value={nftData.item.tokenId}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        tokenId: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Token ID"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Description
                                </label>
                                <input
                                  value={nftData.item.description}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        description: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Description"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Image URL
                                </label>
                                <input
                                  value={nftData.item.image}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        image: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Image URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Image
                                </label>
                                <img
                                  src={nftData.item.image}
                                  alt={`${nftData.item.name}`}
                                  className="self-center rounded-3xl"
                                />
                              </div>
                              <div className="flex flex-col w-1/2">
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {nftData.item.links.opensea ? (
                                    <a
                                      href={nftData.item.links.opensea}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Opensea URL
                                    </a>
                                  ) : (
                                    "Opensea URL"
                                  )}
                                </label>
                                <input
                                  value={nftData.item.links.opensea}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        links: {
                                          ...nftData.item.links,
                                          opensea: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="Opensea URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {nftData.item.links.etherscan ? (
                                    <a
                                      href={nftData.item.links.etherscan}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Etherscan URL
                                    </a>
                                  ) : (
                                    "Etherscan URL"
                                  )}
                                </label>
                                <input
                                  value={nftData.item.links.etherscan}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        links: {
                                          ...nftData.item.links,
                                          etherscan: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="Etherscan URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {nftData.item.links.twitter ? (
                                    <a
                                      href={nftData.item.links.twitter}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Twitter URL
                                    </a>
                                  ) : (
                                    "Twitter URL"
                                  )}
                                </label>
                                <input
                                  value={nftData.item.links.twitter}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        links: {
                                          ...nftData.item.links,
                                          twitter: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="Twitter URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {nftData.item.links.discord ? (
                                    <a
                                      href={nftData.item.links.discord}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Discord URL
                                    </a>
                                  ) : (
                                    "Discord URL"
                                  )}
                                </label>
                                <input
                                  value={nftData.item.links.discord}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        links: {
                                          ...nftData.item.links,
                                          discord: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="Discord URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {nftData.item.links.website ? (
                                    <a
                                      href={nftData.item.links.website}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      Website URL
                                    </a>
                                  ) : (
                                    "Website URL"
                                  )}
                                </label>
                                <input
                                  value={nftData.item.links.website}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      item: {
                                        ...nftData.item,
                                        links: {
                                          ...nftData.item.links,
                                          website: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  placeholder="Website URL"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Max Tickets
                                </label>
                                <input
                                  value={nftData.maxTickets}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      maxTickets: e.target.value,
                                    })
                                  }
                                  placeholder="Max Tickets"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  Price
                                </label>
                                <input
                                  value={nftData.price}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      price: e.target.value,
                                    })
                                  }
                                  placeholder="Price"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                                <label className="mt-4 mb-2 text-base font-medium text-center text-text">
                                  {`Expiry (on ${new Date(
                                    nftData.expiry * 1000
                                  ).toLocaleString()})`}
                                </label>
                                <input
                                  value={nftData.expiry}
                                  onChange={(e) =>
                                    setNftData({
                                      ...nftData,
                                      expiry: e.target.value,
                                    })
                                  }
                                  placeholder="Expiry"
                                  className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                                />
                              </div>
                            </div>
                            <button
                              className="px-4 py-2 mt-4 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
                              onClick={handleCreate}
                            >
                              Create Raffle
                            </button>
                          </Fragment>
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      <div className="flex items-center justify-center gap-10 mt-20">
        <input
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="Search for User"
          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
        />
        <button
          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
          onClick={handleSearch}
        >
          Search
        </button>
        <Transition appear show={userModal} as={Fragment} className="sm:my-40">
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setUserModal(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full p-4 my-auto text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel
                    className="w-full max-w-6xl p-6 overflow-hidden overflow-y-scroll text-left align-middle transition-all transform shadow-xl bg-secondary rounded-2xl"
                    style={{
                      height: "60dvh",
                    }}
                  >
                    <div
                      className="absolute z-10 p-1 rounded-full cursor-pointer top-2 right-2 "
                      onClick={() => setUserModal(false)}
                    >
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-col self-center w-2/3">
                        <div className="flex items-center justify-center gap-4">
                          <p className="text-xl text-center text-bold">
                            {userData?.user.address}
                          </p>
                          <button
                            className="px-4 py-2 ml-4 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
                            onClick={handleBan}
                          >
                            {userData?.user.banned ? "Unban" : "Ban"}
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4 text-lg">
                          <div>{`${userData?.user.points} $STRIPE`}</div>
                          <div>
                            <input
                              value={userPoints}
                              onChange={(e) => setUserPoints(e.target.value)}
                              placeholder="Points"
                              className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform border border-white rounded-3xl bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-none focus:ring-offset-2 focus:ring-offset-secondary focus:ring-opacity-50"
                            />
                            <button
                              className="px-4 py-2 ml-4 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
                              onClick={handleAddPoints}
                            >
                              Add Points
                            </button>
                          </div>
                        </div>
                        <table className="w-full mt-4 table-auto">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                Raffle Name
                              </th>
                              <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                Tickets
                              </th>
                              <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userData?.history?.map((entry, index) => (
                              <tr
                                key={index}
                                className="py-2 border-b border-gray-600 history-data"
                              >
                                <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                  {entry.raffleName}
                                </td>
                                <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                  {entry.purchase.amount}
                                </td>
                                <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                                  {new Date(
                                    entry.purchase.purchasedAt
                                  ).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      <div className="grid grid-cols-1 mt-20 gap-x-8 md:grid-cols-2 lg:grid-cols-3 gap-y-10 text-text">
        {raffles.map((raffle) => (
          <RaffleCard key={raffle._id} raffleDetails={raffle} expired={false} />
        ))}
      </div>
    </div>
  );
};

const globeSVG = (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 0.36 0.36"
    enableBackground="new 0 0 12 12"
    id="\u0421\u043B\u043E\u0439_1"
    xmlSpace="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <path
        d="M0.113 0.263C0.126 0.32 0.151 0.36 0.18 0.36s0.054 -0.04 0.067 -0.098H0.113z"
        fill="#FFFFFF"
      />
      <path
        d="M0.277 0.098h0.063A0.18 0.18 0 0 0 0.246 0.013c0.014 0.022 0.025 0.052 0.031 0.085z"
        fill="#FFFFFF"
      />
      <path
        d="M0.252 0.128H0.108C0.106 0.144 0.105 0.162 0.105 0.18s0.001 0.036 0.003 0.052H0.252c0.002 -0.017 0.003 -0.034 0.003 -0.052s-0.001 -0.036 -0.003 -0.052z"
        fill="#FFFFFF"
      />
      <path
        d="M0.285 0.18c0 0.018 -0.001 0.035 -0.003 0.052h0.07a0.18 0.18 0 0 0 0 -0.105H0.282c0.002 0.017 0.003 0.035 0.003 0.052z"
        fill="#FFFFFF"
      />
      <path
        d="M0.247 0.098C0.234 0.04 0.209 0 0.18 0S0.126 0.04 0.113 0.098h0.133z"
        fill="#FFFFFF"
      />
      <path
        d="M0.083 0.263H0.02a0.18 0.18 0 0 0 0.094 0.085c-0.014 -0.022 -0.025 -0.052 -0.031 -0.085z"
        fill="#FFFFFF"
      />
      <path
        d="M0.075 0.18c0 -0.018 0.001 -0.035 0.003 -0.052H0.008a0.18 0.18 0 0 0 0 0.105h0.07A0.446 0.446 0 0 1 0.075 0.18z"
        fill="#FFFFFF"
      />
      <path
        d="M0.277 0.263c-0.006 0.033 -0.017 0.062 -0.031 0.085A0.18 0.18 0 0 0 0.34 0.263H0.277z"
        fill="#FFFFFF"
      />
      <path
        d="M0.083 0.098c0.006 -0.033 0.017 -0.062 0.031 -0.085A0.18 0.18 0 0 0 0.02 0.098h0.063z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

const discordSVG = (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 0.72 0.72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.61 0.135c-0.046 -0.021 -0.095 -0.036 -0.147 -0.045a0.002 0.002 0 0 0 -0.002 0.001c-0.006 0.011 -0.013 0.025 -0.018 0.037a0.557 0.557 0 0 0 -0.165 0 0.371 0.371 0 0 0 -0.019 -0.037A0.002 0.002 0 0 0 0.257 0.09c-0.051 0.009 -0.101 0.024 -0.147 0.045a0.002 0.002 0 0 0 -0.001 0.001C0.016 0.273 -0.01 0.407 0.003 0.539a0.002 0.002 0 0 0 0.001 0.002 0.601 0.601 0 0 0 0.18 0.089 0.002 0.002 0 0 0 0.003 -0.001c0.014 -0.019 0.026 -0.038 0.037 -0.059 0.001 -0.001 0 -0.003 -0.001 -0.003a0.396 0.396 0 0 1 -0.056 -0.026 0.002 0.002 0 0 1 0 -0.004c0.004 -0.003 0.008 -0.006 0.011 -0.009a0.002 0.002 0 0 1 0.002 0c0.118 0.053 0.245 0.053 0.362 0a0.002 0.002 0 0 1 0.002 0c0.004 0.003 0.007 0.006 0.011 0.009a0.002 0.002 0 0 1 0 0.004c-0.018 0.01 -0.037 0.019 -0.056 0.026a0.002 0.002 0 0 0 -0.001 0.003c0.011 0.021 0.023 0.04 0.037 0.059a0.002 0.002 0 0 0 0.003 0.001 0.599 0.599 0 0 0 0.18 -0.089 0.002 0.002 0 0 0 0.001 -0.002c0.015 -0.153 -0.025 -0.286 -0.106 -0.403a0.002 0.002 0 0 0 -0.001 -0.001ZM0.241 0.458c-0.035 0 -0.065 -0.032 -0.065 -0.071 0 -0.039 0.029 -0.071 0.065 -0.071 0.036 0 0.065 0.032 0.065 0.071 0 0.039 -0.029 0.071 -0.065 0.071Zm0.239 0c-0.035 0 -0.065 -0.032 -0.065 -0.071 0 -0.039 0.029 -0.071 0.065 -0.071 0.036 0 0.065 0.032 0.065 0.071 0 0.039 -0.028 0.071 -0.065 0.071Z"
      fill="#FFFFFF"
    />
  </svg>
);

const twitterSVG = (
  <svg
    fill="#FFFFFF"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="24px"
    height="24px"
    viewBox="0 0 15.36 15.36"
    xmlSpace="preserve"
  >
    <g id="7935ec95c421cee6d86eb22ecd12f847">
      <path
        style={{
          display: "inline",
        }}
        d="M13.776 4.554c0.006 0.135 0.009 0.271 0.009 0.407 0 4.156 -3.164 8.949 -8.948 8.949 -1.776 0 -3.43 -0.521 -4.821 -1.413 0.246 0.029 0.496 0.044 0.75 0.044 1.474 0 2.83 -0.503 3.906 -1.347 -1.377 -0.025 -2.538 -0.935 -2.938 -2.184a3.137 3.137 0 0 0 0.592 0.057c0.287 0 0.564 -0.039 0.829 -0.11 -1.439 -0.289 -2.523 -1.56 -2.523 -3.084 0 -0.013 0 -0.026 0 -0.04a3.135 3.135 0 0 0 1.425 0.393c-0.844 -0.564 -1.399 -1.527 -1.399 -2.618 0 -0.576 0.155 -1.117 0.426 -1.581 1.551 1.903 3.868 3.155 6.482 3.286a3.163 3.163 0 0 1 -0.082 -0.717c0 -1.737 1.408 -3.145 3.145 -3.145 0.905 0 1.722 0.382 2.296 0.993 0.717 -0.141 1.389 -0.403 1.997 -0.763 -0.235 0.735 -0.733 1.351 -1.383 1.74 0.636 -0.076 1.243 -0.245 1.807 -0.495 -0.422 0.631 -0.955 1.184 -1.569 1.628z"
      />
    </g>
  </svg>
);

const openseaSVG = (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12 -5.374 12 -12S18.629 0 12 0ZM5.921 12.403l0.05 -0.082 3.122 -4.884c0.046 -0.07 0.154 -0.062 0.187 0.014 0.521 1.169 0.972 2.623 0.761 3.528 -0.089 0.372 -0.336 0.876 -0.614 1.342a2.405 2.405 0 0 1 -0.118 0.199 0.106 0.106 0 0 1 -0.089 0.046H6.012a0.106 0.106 0 0 1 -0.091 -0.163Zm13.913 1.68a0.109 0.109 0 0 1 -0.065 0.101c-0.242 0.103 -1.07 0.485 -1.414 0.962 -0.878 1.222 -1.548 2.969 -3.048 2.969H9.053c-2.218 0 -4.013 -1.802 -4.013 -4.027v-0.072c0 -0.058 0.048 -0.106 0.108 -0.106h3.485c0.07 0 0.12 0.062 0.115 0.132a1.173 1.173 0 0 0 0.125 0.67 1.225 1.225 0 0 0 1.099 0.682h1.726v-1.346h-1.706a0.11 0.11 0 0 1 -0.089 -0.173c0.019 -0.029 0.038 -0.058 0.062 -0.091a13.192 13.192 0 0 0 0.622 -0.991 7.968 7.968 0 0 0 0.43 -0.859c0.024 -0.053 0.043 -0.108 0.065 -0.161 0.034 -0.094 0.067 -0.182 0.091 -0.269 0.024 -0.074 0.046 -0.151 0.065 -0.223 0.058 -0.25 0.082 -0.514 0.082 -0.787 0 -0.108 -0.005 -0.221 -0.014 -0.326 -0.005 -0.118 -0.019 -0.235 -0.034 -0.353 -0.01 -0.103 -0.029 -0.206 -0.048 -0.312a6.494 6.494 0 0 0 -0.098 -0.468l-0.014 -0.06c-0.029 -0.108 -0.055 -0.209 -0.089 -0.317a11.824 11.824 0 0 0 -0.329 -0.972c-0.043 -0.122 -0.091 -0.24 -0.142 -0.355 -0.072 -0.178 -0.146 -0.338 -0.214 -0.49a3.563 3.563 0 0 1 -0.094 -0.197 5.853 5.853 0 0 0 -0.103 -0.214c-0.024 -0.053 -0.053 -0.103 -0.072 -0.151l-0.211 -0.389c-0.029 -0.053 0.019 -0.118 0.077 -0.101l1.32 0.358h0.01l0.173 0.05 0.192 0.053 0.07 0.019v-0.782C11.698 5.107 12 4.8 12.377 4.8c0.187 0 0.358 0.077 0.478 0.202 0.122 0.125 0.199 0.295 0.199 0.485v1.164l0.142 0.038c0.01 0.005 0.022 0.01 0.031 0.017 0.034 0.024 0.084 0.062 0.146 0.11 0.05 0.038 0.103 0.086 0.166 0.137 0.127 0.103 0.281 0.235 0.446 0.386 0.043 0.038 0.086 0.077 0.127 0.118 0.214 0.199 0.454 0.432 0.684 0.691 0.065 0.074 0.127 0.146 0.192 0.226 0.062 0.079 0.132 0.156 0.19 0.233 0.079 0.103 0.161 0.211 0.235 0.324 0.034 0.053 0.074 0.108 0.106 0.161 0.096 0.142 0.178 0.288 0.257 0.434 0.034 0.067 0.067 0.142 0.096 0.214 0.089 0.197 0.158 0.396 0.202 0.598 0.014 0.043 0.024 0.089 0.029 0.132v0.01c0.014 0.058 0.019 0.12 0.024 0.185a2.057 2.057 0 0 1 -0.034 0.617c-0.019 0.086 -0.043 0.168 -0.072 0.257 -0.031 0.084 -0.06 0.17 -0.098 0.254a3.452 3.452 0 0 1 -0.264 0.502c-0.034 0.06 -0.074 0.122 -0.113 0.182 -0.043 0.062 -0.089 0.122 -0.127 0.18 -0.055 0.074 -0.113 0.151 -0.173 0.221 -0.053 0.072 -0.106 0.144 -0.166 0.209 -0.082 0.098 -0.161 0.19 -0.245 0.278 -0.048 0.058 -0.101 0.118 -0.156 0.17 -0.053 0.06 -0.108 0.113 -0.156 0.161 -0.084 0.084 -0.151 0.146 -0.209 0.202l-0.137 0.122a0.102 0.102 0 0 1 -0.072 0.029h-1.051v1.346h1.322c0.295 0 0.576 -0.103 0.804 -0.298 0.077 -0.067 0.415 -0.36 0.816 -0.802a0.094 0.094 0 0 1 0.05 -0.031l3.65 -1.056a0.107 0.107 0 0 1 0.137 0.103v0.773Z"
      fill="white"
    />
  </svg>
);

const ethereumSVG = (
  <svg
    fill="#FFFFFF"
    width="24px"
    height="24px"
    viewBox="0 0 0.96 0.96"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m0.478 0.719 -0.295 -0.174 0.295 0.415 0.295 -0.415 -0.295 0.174zM0.482 0 0.188 0.489l0.295 0.174 0.295 -0.174z" />
  </svg>
);

const svgMapping = {
  website: globeSVG,
  opensea: openseaSVG,
  etherscan: ethereumSVG,
  twitter: twitterSVG,
  discord: discordSVG,
};

const RaffleCard = ({ raffleDetails }) => {
  const [open, setOpen] = React.useState(false);
  const [raffle, setRaffle] = React.useState(raffleDetails);

  const expired = new Date(raffle.expiry) < new Date();
  console.log(expired);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-5 shadow-md bg-secondary rounded-3xl">
      <div className="text-xl font-bold ">{`${raffle.item.name} #${raffle.item.tokenId}`}</div>
      <div className="mt-6 ">
        <img
          className="object-cover rounded-2xl"
          src={`${raffle.item.image}?img-width=684`}
          alt={`${raffle.item.name} #${raffle.item.tokenId}`}
        />
      </div>
      <div className="flex flex-row items-center justify-center gap-6 mx-3 my-5">
        {Object.keys(raffle.item.links).map(
          (key) =>
            svgMapping[key] &&
            raffle.item.links[key] && (
              <a
                key={key}
                href={raffle.item.links[key]}
                className="flex items-center justify-center w-full transition duration-300 ease-in-out social-icon hover:-translate-y-1"
              >
                {svgMapping[key]}
              </a>
            )
        )}
      </div>
      <hr className="w-full border-gray-600" />
      <div className="flex flex-col items-center justify-center w-full h-full m-3">
        <p className="mt-2 text-base font-medium ">
          {/* Expires at: {new Date(raffle.expiry).toLocaleString()} */}
          {expired ? (
            <span className="text-red-500">Expired</span>
          ) : (
            <span className="text-green-500">Active</span>
          )}
        </p>
        <p className="mt-2 text-base font-medium ">
          Tickets sold {raffle.ticketsSold}/{raffle.maxTickets}
        </p>
      </div>
      <hr className="w-full border-gray-600" />
      <div className="flex flex-row justify-between w-full h-full px-1 mt-3">
        <p className="mt-2 text-base font-medium ">{raffle.price} $STRIPE</p>
        <button
          onClick={handleOpen}
          className="px-4 py-2 text-base font-medium transition duration-500 ease-in-out transform rounded-3xl bg-primary hover:bg-pHover"
        >
          History
        </button>
        <Transition appear show={open} as={Fragment} className="sm:my-40">
          <Dialog as="div" className="relative z-10" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-6xl p-6 overflow-hidden overflow-x-scroll text-left align-middle transition-all transform shadow-xl dialog-panel bg-secondary rounded-2xl">
                    {/* <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-text"
                    >
                      Payment successful
                    </Dialog.Title> */}
                    <div
                      className="absolute z-10 p-1 rounded-full cursor-pointer top-2 right-2 "
                      onClick={handleClose}
                    >
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <table className="w-full mt-4 table-auto">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                            Wallet
                          </th>
                          <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                            Tickets
                          </th>
                          <th className="px-4 py-2 text-sm font-medium leading-4 tracking-wider text-left text-text">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {raffle.history?.map((entry, index) => (
                          <tr
                            key={index}
                            className="py-2 border-b border-gray-600 history-data"
                          >
                            <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                              {entry.address}
                            </td>
                            <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                              {entry.amount}
                            </td>
                            <td className="px-4 py-5 text-sm font-medium leading-4 tracking-wider text-left text-text">
                              {new Date(entry.time).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default AdminDashboard;
