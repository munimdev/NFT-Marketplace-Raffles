import React from "react";
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaSignInAlt, FaWallet } from "react-icons/fa";
import { useModal } from "../context/ModalContext";
import { Link } from "react-router-dom";

import logo from "../assets/images/wld-logo.png";

function Navbar({ transparent = false }) {
  const {
    account,
    connectWalletHandle,
    isWalletAlreadyConnected,
    disconnectWalletFromApp,
    connectWallet,
  } = useModal();

  const navLinks = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Artwork",
      href: "about",
    },
    {
      name: "Wild World",
      href: "mint",
    },
    {
      name: "Characters",
      href: "mint",
    },
    {
      name: "Team",
      href: "mint",
    },
  ];

  return (
    <div className="">
      <Popover
        className={
          transparent
            ? "relative font-medium"
            : "relative text-white font-medium"
        }
        style={{ zIndex: 100 }}
      >
        <div className="container text-white max-w-7xl">
          <div className="flex items-center justify-between py-5 border-gray-100 md:space-x-6">
            <div className="flex items-center justify-start space-x-0 sm:space-x-4 lg:space-x-8">
              <Link to="/">
                {/* <span className="text-white sr-only"></span> */}
                <img
                  // className="w-auto h-1/2 md:h-16"
                  className="nav-logo"
                  // src="assets/logo new.png"
                  src={logo}
                  alt=""
                />
              </Link>
            </div>
            <Popover.Group
              as="nav"
              className="hidden mx-auto space-x-0 md:flex md:gap-6"
            >
              <a
                href="https://wildtigers.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Home</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://mint.wildtigers.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Mint</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/artwork/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Artwork</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/wild-world/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Wild World</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/characters/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Characters</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/team/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 inline-flex items-center rounded-full text-xl text-white nav-item`}
              >
                <span>Team</span>
              </a>
            </Popover.Group>

            <div className="-my-2 lg:hidden ">
              <Popover.Button className="inline-flex items-center justify-center p-2 text-white rounded-md">
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
              </Popover.Button>
            </div>

            <div className="items-center hidden text-xl lg:flex">
              {/* <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div> */}
              {account !== undefined ? (
                <>
                  <button
                    onClick={() => disconnectWalletFromApp()}
                    className="inline-flex items-center justify-center gap-1 px-10 py-3 font-medium text-white bg-transparent border rounded-full shadow-sm nav-wallet border-primary whitespace-nowrap"
                  >
                    {/* <FaWallet className="w-4 " /> */}
                    {/* display first 6 and last 4 chaarcters of user's wallet address saved in: account[0] */}
                    {/* {account[0].slice(0, 6) + "..." + account[0].slice(-4)} */}
                    {"My Account"}
                  </button>
                  {/* spacer div */}
                  <div className="hidden h-10 mr-3 sm:block border-primary dark:border-neutral-6000"></div>
                  {/* <AccountDropdown /> */}
                </>
              ) : (
                <>
                  <button
                    onClick={() => connectWallet()}
                    className="inline-flex items-center justify-center gap-4 px-10 py-3 font-medium text-white bg-transparent border rounded-full shadow-sm nav-wallet border-primary whitespace-nowrap"
                  >
                    {/* <FaWallet className="w-4 " /> */}
                    Connect Wallet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="absolute inset-x-0 top-0 p-2 transition origin-top-right transform lg:hidden"
          >
            <div className="text-white divide-y-2 rounded-lg shadow-lg bg-secondary divide-gray-50 ring-1 ring-white ring-opacity-5">
              <div className="px-5 pt-5 pb-6 ">
                <div className="flex items-center justify-between ">
                  <div>
                    <img
                      className="w-auto h-8 sm:h-10"
                      src="/assets/ynation-logo.svg"
                      alt=""
                    />
                  </div>
                  <div className="-mr-2">
                    <Popover.Button className="inline-flex items-center justify-center p-2 text-white rounded-md">
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
                <div className="py-2 mt-6">
                  <nav className="grid gap-y-8 ">
                    {navLinks.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-2xl hover:bg-neutral-100 hover:text-black rounded-lg"
                      >
                        <span className="block w-full">{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                  {/* <div className="hidden h-6 mr-3 border-b border-white sm:block place-self-center dark:border-neutral-6000"></div> */}
                  <hr className="w-full my-5 border-gray-600" />
                  <div className="items-center text-xl">
                    {/* <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div> */}
                    {account !== undefined ? (
                      <>
                        <button
                          onClick={() => disconnectWalletFromApp()}
                          className="inline-flex items-center justify-center gap-1 px-10 py-3 font-medium text-white bg-transparent border rounded-full shadow-sm nav-wallet border-primary whitespace-nowrap"
                        >
                          {/* <FaWallet className="w-4 " /> */}
                          {/* display first 6 and last 4 chaarcters of user's wallet address saved in: account[0] */}
                          {/* {account[0].slice(0, 6) + "..." + account[0].slice(-4)} */}
                          {"My Account"}
                        </button>
                        {/* spacer div */}
                        <div className="hidden h-10 mr-3 sm:block border-primary dark:border-neutral-6000"></div>
                        {/* <AccountDropdown /> */}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => connectWallet()}
                          className="inline-flex items-center justify-center gap-4 px-10 py-3 font-medium text-white bg-transparent border rounded-full shadow-sm nav-wallet border-primary whitespace-nowrap"
                        >
                          {/* <FaWallet className="w-4 " /> */}
                          Connect Wallet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}

export default Navbar;
