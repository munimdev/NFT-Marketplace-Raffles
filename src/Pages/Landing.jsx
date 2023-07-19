import React, { useState, useEffect, Fragment } from "react";
import logo from "../assets/images/wld-logo.png";
import mintGif from "../assets/images/mint.gif";
import stripeLogo from "../assets/images/stripe-logo.png";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { useModal } from "../context/ModalContext";
import { toast } from "react-toastify";
import { getAllRaffles, getUserRaffles, purchaseTickets } from "../util/api";
import { Link } from "react-router-dom";

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

const Landing = () => {
  const [raffles, setRaffles] = useState([]);
  const [ongoingRaffles, setOngoingRaffles] = useState([]);
  const [expiredRaffles, setExpiredRaffles] = useState([]);
  const { account, user } = useModal();

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const { data } = await getAllRaffles();
        // console.log(data);
        setRaffles(data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchRaffles();
  }, []);

  useEffect(() => {
    const now = new Date();

    const ongoing = raffles
      .filter((r) => new Date(r.expiry) > now)
      .map((r) => ({ ...r, expired: false }));

    ongoing.forEach((raffle) => {
      const timeout = setTimeout(() => {
        raffle.expired = true;
      }, raffle.expiry - now);

      return () => clearTimeout(timeout);
    });

    setOngoingRaffles(ongoing);

    const expired = raffles
      .filter((r) => new Date(r.expiry) <= now)
      .map((r) => ({ ...r, expired: true }));

    setExpiredRaffles(expired);
  }, [raffles]);

  const purchaseTicket = async (raffleId, quantity) => {
    // return promises
    if (!account) {
      return new Promise((_, reject) => {
        reject("Please connect your wallet first");
      });
    }
    const loadingToast = toast.loading("Purchasing ticket...");
    try {
      await purchaseTickets({
        raffleId: raffleId,
        address: account[0],
        quantity: quantity,
      }).catch((error) => {
        return new Promise((_, reject) => {
          toast.dismiss(loadingToast);
          reject(error.response.data.message);
        });
      });
      return new Promise((resolve, _) => {
        toast.dismiss(loadingToast);
        resolve(`Successfully purchased ${quantity} tickets`);
      });
    } catch (error) {
      return new Promise((_, reject) => {
        toast.dismiss(loadingToast);
        reject(error);
      });
    }
  };

  const tabStyle = `
  text-lg font-medium text-gray-500 px-5 py-2.5 text-center
  bg-secondary rounded-t-lg focus:outline-none hover:text-white transition duration-100 ease-in-out
`;

  const activeTabStyle = `
  text-lg font-medium px-5 py-2.5 text-center rounded-t-lg
  bg-primary text-white focus:outline-none
`;

  return (
    <div className="container max-w-5xl mt-10">
      {account && (
        <div className="flex flex-row items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <img
              className="object-cover w-16 rounded-2xl"
              src={mintGif}
              alt="PFP"
            />
            <Link
              to={"/account"}
              className="text-2xl text-white hover:text-pHover"
            >
              {`${account[0].slice(0, 5)} ...`}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center gap-1 ml-14">
              <img
                className="object-cover rounded-2xl"
                style={{ width: "50px" }}
                src={stripeLogo}
                alt="$STRIPE Logo"
              />
              <span
                className="text-white"
                style={{
                  fontSize: "0.675rem",
                }}
              >
                $STRIPE
              </span>
            </div>
            <span className="text-2xl text-white">{user.points} </span>
          </div>
        </div>
      )}
      <Tab.Group>
        <Tab.List className="flex justify-center gap-2 mb-5">
          {ongoingRaffles && ongoingRaffles.length > 0 && (
            <Tab
              className={({ selected }) =>
                selected ? activeTabStyle : tabStyle
              }
            >
              Ongoing
            </Tab>
          )}
          {expiredRaffles && expiredRaffles.length > 0 && (
            <Tab
              className={({ selected }) =>
                selected ? activeTabStyle : tabStyle
              }
            >
              Expired
            </Tab>
          )}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 gap-y-10 text-text">
              {ongoingRaffles.map((raffle) => (
                <RaffleCard
                  key={raffle._id}
                  raffleDetails={raffle}
                  account={account}
                  handlePurchase={purchaseTicket}
                  expired={false}
                />
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 gap-y-10 text-text">
              {expiredRaffles.map((raffle) => (
                <RaffleCard
                  key={raffle._id}
                  raffleDetails={raffle}
                  account={account}
                  handlePurchase={purchaseTicket}
                  expired={true}
                />
              ))}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      {/* {raffles && raffles.length > 0 ? (
        <Tab.Group>
          <Tab.List className="flex justify-center gap-2 mb-5">
            <Tab
              className={({ selected }) =>
                selected ? activeTabStyle : tabStyle
              }
            >
              Ongoing
            </Tab>
            <Tab
              className={({ selected }) =>
                selected ? activeTabStyle : tabStyle
              }
            >
              Expired
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 gap-y-10 text-text">
                {ongoingRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle._id}
                    raffleDetails={raffle}
                    account={account}
                    handlePurchase={purchaseTicket}
                    expired={false}
                  />
                ))}
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 gap-y-10 text-text">
                {expiredRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle._id}
                    raffleDetails={raffle}
                    account={account}
                    handlePurchase={purchaseTicket}
                    expired={true}
                  />
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      ) : (
        <div className="flex justify-center">
          <div className="w-32 h-32 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      )} */}

      <div>
        <div className="flex justify-center my-16">
          <img
            className="object-cover rounded-2xl"
            style={{ width: "20rem" }}
            src={logo}
            alt="Wild Tigers"
          />
        </div>
        <p className="text-2xl text-white">
          {"Wild Tigers Marketplace is coming soon!"}
        </p>
        <div className="flex flex-row items-center justify-center gap-5 m-3 mt-6">
          <a
            href="/"
            className="flex items-center justify-center px-4 py-4 transition duration-300 ease-in-out bg-primary hover:bg-pHover hover:-translate-y-1"
            style={{
              borderRadius: "100%",
            }}
          >
            {twitterSVG}
          </a>
          <a
            href="/"
            className="flex items-center justify-center px-4 py-4 transition duration-300 ease-in-out bg-primary hover:bg-pHover hover:-translate-y-1"
            style={{
              borderRadius: "100%",
            }}
          >
            {discordSVG}
          </a>
          <a
            href="/"
            className="flex items-center justify-center px-4 py-4 transition duration-300 ease-in-out bg-primary hover:bg-pHover hover:-translate-y-1"
            style={{
              borderRadius: "100%",
            }}
          >
            {ethereumSVG}
          </a>
          <a
            href="/"
            className="flex items-center justify-center px-4 py-4 transition duration-300 ease-in-out bg-primary hover:bg-pHover hover:-translate-y-1"
            style={{
              borderRadius: "100%",
            }}
          >
            {openseaSVG}
          </a>
        </div>
      </div>
    </div>
  );
};

const svgMapping = {
  website: globeSVG,
  opensea: openseaSVG,
  etherscan: ethereumSVG,
  twitter: twitterSVG,
  discord: discordSVG,
};

const RaffleCard = ({ raffleDetails, account, handlePurchase, expired }) => {
  const [open, setOpen] = React.useState(false);
  const [days, setDays] = React.useState(0);
  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);
  const [ticketBalance, setTicketBalance] = React.useState(0);
  const [raffle, setRaffle] = React.useState(raffleDetails);

  React.useEffect(() => {
    if (account) {
      const fetchBalance = async () => {
        const { data } = await getUserRaffles({
          raffleId: raffle._id,
          address: account[0],
        });
        setTicketBalance(data?.length);
      };
      try {
        fetchBalance();
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      setTicketBalance(0);
    }
  }, [account, raffle._id]);

  React.useEffect(() => {
    if (open && !expired) {
      const intervalId = setInterval(() => {
        const timeDifference = new Date(raffle.expiry) - new Date();

        if (timeDifference < 0) {
          clearInterval(intervalId);
        } else {
          const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

          setDays(days);
          setHours(hours);
          setMinutes(minutes);
          setSeconds(seconds);
        }
      }, 1000);

      // Clear interval on component unmount or when 'open' changes to false
      return () => clearInterval(intervalId);
    }
  }, [raffle.expiry, open, expired]);

  const [counter, setCounter] = React.useState(1);
  const maxCount = 5;

  const handleIncrement = () => {
    if (counter < maxCount) {
      setCounter((counter) => counter + 1);
    }
  };
  const handleDecrement = () => {
    if (counter > 1) {
      setCounter((counter) => counter - 1);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePurchaseTicket = async () => {
    try {
      const res = await handlePurchase(raffle._id, counter);
      toast.success(res);
      setTicketBalance((ticketBalance) => ticketBalance + counter);
      setRaffle((raffle) => ({
        ...raffle,
        tickets: raffle.tickets + counter,
        ticketsSold: raffle.ticketsSold + counter,
      }));
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-5 shadow-md bg-secondary rounded-3xl">
      <div className="text-xl font-bold ">{`${raffle.item.name} #${raffle.item.tokenId}`}</div>
      <div className="mt-6 ">
        <img
          className="object-cover rounded-2xl"
          src={`${raffle.item.image}?img-width=874`}
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
          Raffle for {`${raffle.item.name} #${raffle.item.tokenId}`}
        </p>
        <p className="mt-2 text-base font-medium ">
          {raffle.price} $STRIPE per ticket
        </p>
      </div>
      <hr className="w-full border-gray-600" />
      <div className="flex flex-col items-center justify-center w-full h-full m-3">
        <p className="mt-2 text-base font-medium ">Type: RAFFLE</p>
        <p className="mt-2 text-base font-medium ">
          Maximum entries: 5 per wallet
        </p>
        <p className="mt-2 text-base font-medium ">
          Expires at: {new Date(raffle.expiry).toLocaleString()}
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
          Buy Ticket
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
                  <Dialog.Panel className="w-full max-w-6xl p-6 overflow-hidden text-left align-middle transition-all transform shadow-xl bg-secondary rounded-2xl">
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
                    <div className="grid grid-cols-1 gap-4 mt-2 lg:grid-cols-2">
                      <div className="flex flex-col items-center justify-center p-8">
                        <div className="text-xl font-bold">
                          {`${raffle.item.name} #${raffle.item.tokenId}`}
                        </div>
                        <div className="mt-4">
                          <img
                            className="object-cover w-full h-full rounded-2xl"
                            src={`${raffle.item.image}?img-width=874`}
                            alt={`${raffle.item.name} #${raffle.item.tokenId}`}
                          />
                        </div>
                        <div className="self-start mt-2 text-base text-left text-gray-500">
                          {raffle.item.description}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-8">
                        <p className="text-xl font-medium ">
                          {raffle.ticketsSold}/{raffle.maxTickets}
                          {" tickets "}
                          <span className="text-primary">sold</span>
                        </p>
                        <div className="flex flex-row items-center justify-center w-full gap-2 mt-20 text-3xl lg:gap-4 countdown-timer">
                          <div className="flex flex-col items-center">
                            <div className="pb-1 text-base lg:text-xl">{`${
                              days !== 1 ? "Days" : "Day"
                            }`}</div>
                            <div className="flex items-center justify-center w-12 h-12 border-2 md:w-16 md:h-16 lg:w-20 lg:h-20 border-accent rounded-2xl">
                              {days}
                            </div>
                          </div>
                          <div className="mt-4 text-2xl">:</div>
                          <div className="flex flex-col items-center">
                            <div className="pb-1 text-base lg:text-xl">{`${
                              hours !== 1 ? "Hours" : "Hour"
                            }`}</div>
                            <div className="flex items-center justify-center w-12 h-12 border-2 md:w-16 md:h-16 lg:w-20 lg:h-20 border-accent rounded-2xl">
                              {hours}
                            </div>
                          </div>
                          <div className="mt-4 text-2xl">:</div>
                          <div className="flex flex-col items-center">
                            <div className="pb-1 text-base lg:text-xl">{`${
                              minutes !== 1 ? "Minutes" : "Minute"
                            }`}</div>
                            <div className="flex items-center justify-center w-12 h-12 border-2 md:w-16 md:h-16 lg:w-20 lg:h-20 border-accent rounded-2xl">
                              {minutes}
                            </div>
                          </div>
                          <div className="mt-4 text-2xl">:</div>
                          <div className="flex flex-col items-center">
                            <div className="pb-1 text-base lg:text-xl">{`${
                              seconds !== 1 ? "Seconds" : "Second"
                            }`}</div>
                            <div className="flex items-center justify-center w-12 h-12 border-2 md:w-16 md:h-16 lg:w-20 lg:h-20 border-accent rounded-2xl">
                              {seconds}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-center w-full gap-20 mb-10 mt-14">
                          <button
                            className="w-10 h-10 text-base font-medium border border-primary"
                            onClick={handleDecrement}
                          >
                            -
                          </button>
                          <span className="text-2xl font-medium">
                            {counter}
                          </span>
                          <button
                            className="w-10 h-10 text-base font-medium border border-primary"
                            onClick={handleIncrement}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-center justify-center w-full">
                          <div className="flex flex-row items-center gap-8">
                            <button
                              className="text-base font-medium"
                              onClick={handlePurchaseTicket}
                            >
                              <div className="flex flex-row items-center justify-center w-full gap-2 px-5 py-3 bg-primary rounded-3xl hover:bg-pHover">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                  />
                                </svg>
                                <span>Purchase</span>
                              </div>
                            </button>
                            <p className="text-lg">
                              {/* {`${counter * 10} $STRIPE`} */}
                              {`${counter * raffle.price} $STRIPE`}
                            </p>
                          </div>
                        </div>
                        <p className="mt-10 text-lg">
                          You currently own{" "}
                          <span className="text-primary">{ticketBalance}</span>{" "}
                          tickets
                        </p>
                      </div>
                    </div>
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

export default Landing;
