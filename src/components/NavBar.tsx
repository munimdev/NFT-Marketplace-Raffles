import React from "react";
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useModal } from "../context/ModalContext";
import { Link } from "react-router-dom";

function Navbar({ transparent = false }) {
  const {
    account,
    connectWalletHandle,
    isWalletAlreadyConnected,
    disconnectWalletFromApp,
    newConnectWallet,
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
    <div>
      <Popover
        className={
          transparent
            ? "relative font-medium"
            : "relative text-white font-medium"
        }
        style={{ zIndex: 100 }}
      >
        <div className="text-white">
          <div className="flex items-center py-5 border-gray-100 md:space-x-6">
            <Popover.Group
              as="nav"
              className="hidden mx-auto space-x-0 md:flex md:gap-2"
            >
              <a
                href="https://wildtigers.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 inline-flex items-center rounded-full text-3xl text-black hover:bg-neutral-100 hover:text-[#e08b3c]`}
              >
                <span>Home</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/artwork/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 inline-flex items-center rounded-full text-3xl text-black hover:bg-neutral-100 hover:text-[#e08b3c]`}
              >
                <span>Artwork</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/wild-world/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 inline-flex items-center rounded-full text-3xl text-black hover:bg-neutral-100 hover:text-[#e08b3c]`}
              >
                <span>Wild World</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/characters/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 inline-flex items-center rounded-full text-3xl text-black hover:bg-neutral-100 hover:text-[#e08b3c]`}
              >
                <span>Characters</span>
              </a>
              <div className="hidden h-6 mr-3 border-l border-black sm:block place-self-center dark:border-neutral-6000"></div>
              <a
                href="https://wildtigers.xyz/team/"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 inline-flex items-center rounded-full text-3xl text-black hover:bg-neutral-100 hover:text-[#e08b3c]`}
              >
                <span>Team</span>
              </a>
            </Popover.Group>

            <div className="-my-2 md:hidden ml-[90%]">
              <Popover.Button className="inline-flex items-center justify-center p-2 text-white rounded-md">
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="w-6 h-6" aria-hidden="true" />
              </Popover.Button>
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
            className="absolute inset-x-0 top-0 p-2 transition origin-top-right transform md:hidden"
          >
            <div className="text-white bg-[#e08b3c] divide-y-2 rounded-lg shadow-lg divide-gray-50 ring-1 ring-white ring-opacity-5">
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
