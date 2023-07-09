const db = require("../../db");
const Users = db.User;
const Legendary = db.Legendary;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
var ObjectId = require("mongodb").ObjectID;
const axios = require("axios");
const Web3 = require("web3");
// matic web3 infura
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://polygon-mainnet.g.alchemy.com/v2/FNQUi5jSJLMFUvglT44EAeR5N6Gar43i"
  )
);
const abi = [
  {
    inputs: [{ internalType: "address", name: "_starter", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "SetAccountName",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "child",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "parent",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "SetParent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getAccountName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getChildCounts",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getLevelOnes",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getParent",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_account", type: "address" }],
    name: "getParentName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isNeedLink",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_account", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
    ],
    name: "setAccountName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_need", type: "bool" }],
    name: "setIsNeedLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_child", type: "address" },
      { internalType: "address", name: "_parent", type: "address" },
      { internalType: "string", name: "_name", type: "string" },
    ],
    name: "setParent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_starter", type: "address" }],
    name: "setStarter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "starter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
const contractAddress = "0x09Db320e8a17735c53BeAb385B83B04D8e872F22";
const contract = new web3.eth.Contract(abi, contractAddress);
const PRIVATE_KEY =
  "0xbdea35746c74eee3907ec6fd7bcb1b62d8b852cec3662a6d43389565e2257da3";
const signerWallet = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
const cloneAddress = "0x030884460247300e0e11E16b633185929fCd154a";
const ADDRESS = "0x1936d4B064624b379aACC87E151e22D628b584E3";
const cloneABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "COMMISION_PERCENT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERCENTS_DIVIDER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "string", name: "_userLink", type: "string" },
      { internalType: "address", name: "_sponsor", type: "address" },
    ],
    name: "addInitialUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "string", name: "_userLink", type: "string" },
    ],
    name: "addInitialUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getDownlineCount",
    outputs: [
      { internalType: "uint256", name: "level1", type: "uint256" },
      { internalType: "uint256", name: "level2", type: "uint256" },
      { internalType: "uint256", name: "level3", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getDownlineNames",
    outputs: [
      { internalType: "string[]", name: "level1", type: "string[]" },
      { internalType: "string[]", name: "level2", type: "string[]" },
      { internalType: "string[]", name: "level3", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getLink",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_level", type: "uint256" },
    ],
    name: "getNLevelUpline",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_affiliate", type: "address" }],
    name: "getSponsor",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getSponsorName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getTotalEarned",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_link", type: "string" }],
    name: "isALinkValid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_name", type: "string" }],
    name: "isUserNameRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_affiliateLink", type: "string" },
      { internalType: "string", name: "_userLink", type: "string" },
    ],
    name: "signUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "string", name: "user_name", type: "string" },
      { internalType: "address", name: "user_address", type: "address" },
      { internalType: "address", name: "sponsor_address", type: "address" },
      { internalType: "string", name: "user_link", type: "string" },
      { internalType: "uint256", name: "total", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const cloneContract = new web3.eth.Contract(cloneABI, cloneAddress);

exports.create = (req, res) => {
  const user = new Users({
    address: req.body.address,
    username: req.body.username,
    pernum: "",
    // avatar: req.body.avatar,
    verified: false,
    password: req.body.password,
    sponsorName: req.body.sponsorName,
    sponsorAddress: req.body.sponsorAddress,
  });

  Users.find({ address: req.body.address })
    .then((docs) => {
      // console.log("[Create user] docs = ", docs);
      if (docs.length > 0) {
        return res.send({ code: 1 });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return res
              .status(501)
              .send({ success: false, message: "Cannot create the new user." });
          }
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
              return res
                .status(501)
                .send({
                  success: false,
                  message: "Cannot create the new user.",
                });
            } else {
              user.password = hash;
              user.save((err, docs) => {
                if (!err) {
                  const jwtToken = jwt.sign(
                    {
                      id: docs._id,
                      // isAdmin: (docs.address === admin_address.toLowerCase()) ? 1 : 0,
                      // admin_address = ["0x7dB5cb3d1945B6B2afdf93a6aA48f3698D87f254", "0x7795B7bd82B361b6FF9C2f32145C70AD1CaC1e77"];
                      isAdmin:
                        docs.address === admin_address[0].toLowerCase() ||
                        docs.address === admin_address[1].toLowerCase()
                          ? 1
                          : 0,
                      ...docs,
                    },
                    jwt_enc_key,
                    { expiresIn: signIn_break_timeout }
                  );
                  return res.status(200).send({
                    success: true,
                    token: jwtToken,
                    message: "Successfully create a new new user.",
                  });
                } else
                  return res
                    .status(501)
                    .send({
                      success: false,
                      message: "Cannot create the new user.",
                    });
              });
            }
          });
        });
      }
    })
    .catch((err) => {
      return res
        .status(501)
        .send({ success: false, message: "Internal server error." });
    });
};

exports.info = (req, res) => {
  console.log("[User info] req.body.address = ", req.body.address);
  Users.findOne(
    {
      // find the user whose 'address' field is equal to the 'address' field of the request body
      address: req.body.address.toLowerCase(),
    },
    (err, docs) => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: "Internal server error." });
      }
      if (docs === undefined || docs === null) {
        return res
          .status(404)
          .send({ success: false, message: "Unregistered." });
      }
      return res.status(200).send({ success: true, user: docs });
    }
  );
};

exports.updateAddresses = (req, res) => {
  // Iterate through all users and update their addresses to lowercase
  Users.find({}, (err, docs) => {
    if (err) {
      return res
        .status(500)
        .send({ success: false, message: "Internal server error." });
    }
    if (docs === undefined || docs === null) {
      return res.status(404).send({ success: false, message: "Unregistered." });
    }
    docs.forEach((doc) => {
      Users.findByIdAndUpdate(
        doc._id,
        { address: doc.address.toLowerCase() },
        (err, docs) => {
          if (err) {
            return res
              .status(500)
              .send({ success: false, message: "Internal server error." });
          }
          if (docs === undefined || docs === null) {
            return res
              .status(404)
              .send({ success: false, message: "Unregistered." });
          }
        }
      );
    });
    return res
      .status(200)
      .send({ success: true, message: "Successfully updated all addresses." });
  });
};

exports.getUsername = (req, res) => {
  Users.findOne(
    {
      // find the user whose 'address' field is equal to the 'address' field of the request body
      address: req.params.address.toLowerCase(),
    },
    (err, docs) => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: "Internal server error." });
      }
      if (docs === undefined || docs === null) {
        return res
          .status(404)
          .send({ success: false, message: "Unregistered." });
      }
      return res.status(200).send({ success: true, username: docs.username });
    }
  );
};

exports.clone = async (req, res) => {
  const clone_url = "http://localhost:5000/api/users/all";

  let events = await contract.getPastEvents("SetParent", {
    filter: {},
    fromBlock: "32550490",
    toBlock: "38462007",
  });

  events = events.map((event) => {
    const data = {
      child: event.returnValues.child,
      sponsorAddress: event.returnValues.parent,
      name: event.returnValues.name,
    };
    return data;
  });

  // delete duplicate events
  events = events.filter(
    (event, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.child === event.child &&
          t.sponsorAddress === event.sponsorAddress &&
          t.name === event.name
      )
  );

  console.log("Length before = ", events.length);

  // delete all those child whose parent is not in the list
  events = events.filter((event) => {
    return (
      events.find((event2) => event2.child === event.sponsorAddress) !==
      undefined
    );
  });

  console.log("Length after = ", events.length);

  // TESTING ONLY
  // res.status(200).send({ success: true, events: events, length: events.length });

  let users = await axios.get(clone_url);

  users = users.data.users;

  console.log("Length before = ", users.length);

  // users = users.filter((user) => {
  //     // console.log(events.find((event) => event.child === user.address));
  //     return events.find((event) => event.child === user.address) !== undefined;
  // })
  users = users.reduce((acc, user) => {
    const event = events.find((event) => event.child === user.address);
    if (event !== undefined) {
      const sponsor = users.find(
        (user) => user.address === event.sponsorAddress
      );
      if (sponsor !== undefined) {
        user = {
          ...user,
          sponsorAddress: event.sponsorAddress,
          sponsorName: sponsor.username,
        };
        acc.push(user);
      }
    }
    return acc;
  }, []);

  console.log("Length after = ", users.length);

  // res.status(200).send({ success: true, events: events, length: events.length, users: users, user_length: users.length });

  // res.status(200).send({ success: true, users: (events.find((event) => event.child === user.address)).sponsorAddress, length: users.length });
  // console.log("[Clone] users = ", users)
  // res.status(200).send({ success: true, users: users, length: users.length });

  // Users.insertMany(users, (err, docs) => {
  //     if (!err){
  //         return res.status(200).send({
  //             success: true,
  //             message: "Successfully clone the users.",
  //             data: docs
  //         });
  //     }
  //     else {
  //         // return res.status(501).send({ success: false, message: "Cannot clone the users." });
  //     }
  // })

  const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // define delay function
  var nonce = await web3.eth.getTransactionCount(ADDRESS);
  console.log("nonce = ", nonce);

  async function sendTransaction(
    username,
    address,
    link,
    sponsorAddress,
    nonce
  ) {
    try {
      const tx = cloneContract.methods
        .addInitialUser(username, address, link, sponsorAddress)
        .encodeABI();
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await cloneContract.methods
        .addInitialUser(username, address, link, sponsorAddress)
        .estimateGas({ from: ADDRESS });
      const txData = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice * 2),
        gasLimit: web3.utils.toHex(gasLimit * 2),
        to: cloneAddress,
        from: ADDRESS,
        data: tx,
      };
      const txSigned = await web3.eth.accounts.signTransaction(
        txData,
        PRIVATE_KEY
      );
      const txHash = await web3.eth.sendSignedTransaction(
        txSigned.rawTransaction
      );
      console.log("txHash = ", txHash);
      return txHash;
    } catch (error) {
      console.log("error = ", error);
      return error;
    }
  }

  async function sendTransactions(users, nonce) {
    for (let i = 0; i < users.length; i++) {
      try {
        console.log(`Username ${users[i].username} is being registered.`);
        const registrationStatus = await cloneContract.methods
          .isRegistered(users[i].address)
          .call();
        console.log("registrationStatus = ", registrationStatus);
        if (registrationStatus == true) {
          console.log(`Username ${users[i].username} already registered.`);
          await delay(200);
          continue;
        }
        const txHash = await sendTransaction(
          users[i].username,
          users[i].address,
          users[i].address,
          users[i].sponsorAddress,
          nonce
        );
        await delay(200);
        nonce++;
        console.log("txHash = ", txHash);
      } catch (error) {
        console.log("error = ", error);
      }
    }
  }

  await sendTransactions(users, nonce);
};
// )};

exports.getAllUsers = (req, res) => {
  Users.find({}, (err, docs) => {
    if (err) {
      return res
        .status(500)
        .send({ success: false, message: "Internal server error." });
    }
    return res
      .status(200)
      .send({ success: true, users: docs, length: docs.length });
  });
};

exports.deleteExtraUsers = (req, res) => {
  // delete all those users whose address is not in the list
  const list = [
    "0x7db5cb3d1945b6b2afdf93a6aa48f3698d87f254",
    "0x7795b7bd82b361b6ff9c2f32145c70ad1cac1e77",
  ];
  Users.deleteMany({ address: { $nin: list } }, (err, docs) => {
    if (err) {
      return res
        .status(500)
        .send({ success: false, message: "Internal server error." });
    }
    return res
      .status(200)
      .send({ success: true, message: "Successfully delete the extra users." });
  });
};

exports.login = (req, res) => {
  Users.findOne(
    {
      address: {
        $regex: new RegExp(req.body.address, "i"),
      },
    },
    (err, docs) => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: "Internal server error." });
      }
      if (docs === undefined || docs === null) {
        return res
          .status(404)
          .send({ success: false, message: "Unregistered." });
      }
      if (docs.password === undefined || docs.username !== req.body.username) {
        return res
          .status(404)
          .send({ success: false, message: "Account info is not correct!" });
      } else {
        const jwtToken = jwt.sign(
          {
            id: docs._id,
            isAdmin:
              docs.address === admin_address[0].toLowerCase() ||
              docs.address === admin_address[1].toLowerCase()
                ? 1
                : 0,
            ...docs,
          },
          jwt_enc_key,
          { expiresIn: signIn_break_timeout }
        );
        // console.log("jwtToken:", jwtToken);
        return res.status(200).send({ success: true, token: jwtToken });
      }
    }
  );
};

exports.simpleLogin = (req, res) => {
  Users.findOne(
    {
      address: {
        $regex: new RegExp(req.body.address, "i"),
      },
    },
    (err, docs) => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: "Internal server error." });
      }
      if (docs === undefined || docs === null) {
        return res
          .status(404)
          .send({ susccess: false, message: "Unregistered." });
      }
      // if (docs.password === undefined || docs.username !== req.body.username) {
      //     return res.status(404).send({ success: false, message: "Account info is not correct!" });
      // }
      else {
        const userId = docs._id;
        Legendary.findOne(
          {
            winnerId: userId,
            isSold: 0,
          },
          (err, itemDocs) => {
            // console.log("SimpleLogin itemDocs=", itemDocs);
            const jwtToken = jwt.sign(
              {
                id: userId,
                isAdmin:
                  docs.address === admin_address[0].toLowerCase() ||
                  docs.address === admin_address[1].toLowerCase()
                    ? 1
                    : 0,
                ...docs,
                item: itemDocs ? itemDocs : null,
              },
              jwt_enc_key,
              { expiresIn: signIn_break_timeout }
            );
            // console.log("jwtToken:", jwtToken);
            return res.status(200).send({ success: true, token: jwtToken });
          }
        );
      }
    }
  );
};

exports.checkUsername = (req, res) => {
  const { username } = req.body;
  Users.findOne(
    {
      username,
    },
    (err, docs) => {
      if (err) {
        return res
          .status(200)
          .send({ success: false, message: "Username duplicated!" });
      } else if (docs === undefined || docs === null) {
        return res
          .status(200)
          .send({ success: true, message: "Available username" });
      }
      return res
        .status(200)
        .send({ success: false, message: "Username duplicated!" });
    }
  );
};

exports.getDownline = (req, res) => {
  const { addresses } = req.body;
  const queryItemAry = [];
  for (let i = 0; i < addresses.length; i++) {
    queryItemAry.push({ address: addresses[i] });
  }
  const query = {
    $or: queryItemAry,
  };

  Users.find(query)
    .then(async (data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.updatePerNum = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Update data cannot be empty!",
    });
  }
  Users.findByIdAndUpdate(
    req.body.id,
    {
      pernum: req.body.pernum,
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          success: false,
          message: "Cannot add PerNum to the user.",
        });
      } else {
        return res.status(200).send({
          success: true,
          message: "Added Pernum successfully!",
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({
        success: false,
        message: "Error updating user",
      });
    });
};

exports.updateMailAddress = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Update data cannot be empty!",
    });
  }
  Users.findByIdAndUpdate(
    req.body.id,
    {
      mail: req.body.mail,
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          success: false,
          message: "Cannot add email info to the user.",
        });
      } else {
        return res.status(200).send({
          success: true,
          message: "Added Email address successfully!",
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({
        success: false,
        message: "Error updating user",
      });
    });
};

exports.updateYEMBalance = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: false,
      message: "Update data cannot be empty!",
    });
  }
  Users.findOneAndUpdate(
    { username: req.body.username },
    {
      yem: req.body.yem,
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          success: false,
          message: "Cannot add yem info to the user.",
        });
      } else {
        return res.status(200).send({
          success: true,
          message: "Updated YEM balance successfully!",
        });
      }
    })
    .catch((err) => {
      return res.status(500).send({
        success: false,
        message: "Error updating user",
      });
    });
};

exports.getNumberOfUsers = (req, res) => {
  Users.find()
    .count()
    .then((data) => {
      return res.status(200).send({ success: true, numberOfUsers: data });
    })
    .catch((err) => {
      return res
        .status(501)
        .send({ success: false, message: "Internal Server Error!" });
    });
};

exports.getUserBalance = (req, res) => {
  const { username } = req.body;
  console.log("username:", username);
  Users.findOne({ username: username }, (err, doc) => {
    if (err)
      return res
        .status(200)
        .send({ success: false, message: "Internal Server Error!" });
    if (doc === undefined || doc === null) {
      return res.status(200).send({ success: true, balance: -1 });
    } else {
      return res.status(200).send({ success: true, balance: doc.yem });
    }
  });
};
