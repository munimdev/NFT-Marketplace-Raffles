const db = require("../../db");
const Users = db.User;
const Tickets = db.Ticket;
const Raffles = db.Raffle;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
const { ObjectId } = require("mongodb");
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
          .send({ success: false, message: "User not found." });
      }
      return res.status(200).send({ success: true, user: docs });
    }
  );
};

exports.getAllUsers = async (req, res) => {
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

exports.banUser = async (req, res) => {
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

  if (user === undefined || user === null) {
    return res.status(404).send({ success: false, message: "User not found." });
  }

  user.banned = true;

  await user.save().catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  return res
    .status(200)
    .send({ success: true, data: user, message: "User banned." });
};

exports.unbanUser = async (req, res) => {
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

  if (user === undefined || user === null) {
    return res.status(404).send({ success: false, message: "User not found." });
  }

  user.banned = false;

  await user.save().catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  return res
    .status(200)
    .send({ success: true, data: user, message: "User unbanned." });
};

exports.addPoints = async (req, res) => {
  const { address, points } = req.body;
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

  if (!points) {
    return res.status(400).send({ success: false, message: "Missing points." });
  }

  const user = await Users.findOne({
    address: web3.utils.toChecksumAddress(address),
  }).catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  if (user === undefined || user === null) {
    return res.status(404).send({ success: false, message: "User not found." });
  }

  user.points = user.points + Number(points);

  await user.save().catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  return res
    .status(200)
    .send({ success: true, data: user, message: "User points updated." });
};

// returns a user with all the raffles they have participated in
// plus their purchase history for each raffle
exports.search = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).send({
        success: false,
        message: "No address provided",
      });
    }

    if (!web3.utils.isAddress(address)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid address." });
    }

    const user = await Users.findOne({
      address: web3.utils.toChecksumAddress(address),
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const history = await Tickets.aggregate([
      {
        $match: {
          user: new ObjectId(user._id),
        },
      },
      {
        $lookup: {
          from: "raffles",
          localField: "raffle",
          foreignField: "_id",
          as: "raffle",
        },
      },
      {
        $unwind: "$raffle",
      },
      {
        $group: {
          _id: {
            raffleId: "$raffle._id",
            raffleName: "$raffle.item.name",
            tokenId: "$raffle.item.tokenId",
            purchaseId: "$purchaseId",
          },
          purchasedAt: { $max: "$purchasedAt" },
          amount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.raffleId",
          raffleName: { $first: "$_id.raffleName" },
          tokenId: { $first: "$_id.tokenId" },
          purchases: {
            $push: {
              purchaseId: "$_id.purchaseId",
              amount: "$amount",
              purchasedAt: "$purchasedAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          raffleId: "$_id",
          raffleName: 1,
          tokenId: 1,
          purchases: 1,
        },
      },
    ]);

    res.status(200).send({
      success: true,
      data: {
        user: {
          ...user._doc,
          history: history,
        },
      },
      message: "User and purchase history retrieved successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};
