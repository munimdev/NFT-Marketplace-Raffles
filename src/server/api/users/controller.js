const db = require("../../db");
const Users = db.User;
// const Legendary = db.Legendary;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
var ObjectId = require("mongodb").ObjectID;
const web3 = require("web3");

// exports.create = (req, res) => {
//   console.log("[User create] req.body = ", req.body);
//   const { address } = req.body;
//   if (!address) {
//     return res
//       .status(400)
//       .send({ success: false, message: "Missing address." });
//   }

//   if (!web3.utils.isAddress(address)) {
//     return res
//       .status(400)
//       .send({ success: false, message: "Invalid address." });
//   }

//   Users.findOne(
//     {
//       address: web3.utils.toChecksumAddress(address),
//     },
//     (err, docs) => {
//       if (err) {
//         return res
//           .status(500)
//           .send({ success: false, message: "Internal server error." });
//       }
//       if (docs !== undefined && docs !== null) {
//         return res
//           .status(200)
//           .send({ success: true, message: "User already exists.", data: docs });
//       }
//       const newUser = new Users({
//         address: web3.utils.toChecksumAddress(address),
//       });
//       newUser.save((err, docs) => {
//         if (err) {
//           return res
//             .status(500)
//             .send({ success: false, message: "Internal server error." });
//         }
//         return res.status(200).send({ success: true, user: docs });
//       });
//     }
//   );
// };

exports.create = async (req, res) => {
  console.log("[User create] req.body = ", req.body);
  const { address } = req.body;
  if (!address) {
    return res
      .status(400)
      .send({ success: false, message: "Missing address." });
  }

  if (!web3.utils.isAddress(address)) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid address." });
  }

  const user = await Users.findOne({
    address: web3.utils.toChecksumAddress(address),
  }).catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  if (user !== undefined && user !== null) {
    return res
      .status(200)
      .send({ success: true, message: "User already exists.", data: user });
  }

  const newUser = new Users({
    address: web3.utils.toChecksumAddress(address),
  });

  await newUser.save().catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  return res.status(200).send({ success: true, data: newUser });
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
