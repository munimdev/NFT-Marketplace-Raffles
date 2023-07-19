const db = require("../../db");
const Users = db.User;
const Raffles = db.Raffle;
const Tickets = db.Ticket;
// const Legendary = db.Legendary;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
const opensea_key = require("../../../env").opensea_key;
// var ObjectId = require("mongodb").ObjectID;
const { ObjectId } = require("mongodb");
const web3 = require("web3");
const dummyData = require("./raffleData.json");

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
};

// use enum for the above

const RESPONSE_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal server error.",
};

exports.dummy = async ({}, res) => {
  try {
    await Raffles.deleteMany({});
    await Tickets.deleteMany({});

    let dummyJson = JSON.parse(JSON.stringify(dummyData));

    const dataToInsert = dummyJson.map((item) => ({
      ...item,
      expiry: new Date(item.expiry * 1000),
    }));

    const docs = await Raffles.insertMany(dataToInsert);

    res.status(HTTP_STATUS.OK).send({ success: true, data: docs });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

// exports.getAllRaffles = (req, res) => {
//   console.log("[Raffle getAllRaffles] req.body = ", req.body);
//   Raffles.find({}, (err, docs) => {
//     if (err) {
//       return res
//         .status(500)
//         .send({ success: false, message: "Internal server error." });
//     }
//     return res.status(200).send({ success: true, raffles: docs });
//   });
// };

exports.getAllRaffles = async (req, res) => {
  // console.log("[Raffle getAllRaffles] req.body = ", req.body);
  // const { address } = req.body;
  // if (!address) {
  //   return res
  //     .status(400)
  //     .send({ success: false, message: "Missing address." });
  // }

  // if (!web3.utils.isAddress(address)) {
  //   return res
  //     .status(400)
  //     .send({ success: false, message: "Invalid address." });
  // }

  // get all raffles
  const raffles = await Raffles.find({}).catch((err) => {
    return res
      .status(500)
      .send({ success: false, message: "Internal server error." });
  });

  return res.status(200).send({ success: true, data: raffles });
};

// // get all user's raffles
// const userRaffles = await Users.findOne({
//   address: web3.utils.toChecksumAddress(address),
// }).catch((err) => {
//   console.log("Error getting user's raffles: ", err);
//   return res
//     .status(500)
//     .

// Fetch tickets for a raffle by user address
exports.getRaffleTicketsByUser = async (req, res) => {
  const { raffleId, userAddress } = req.params;

  try {
    const user = await Users.findOne({
      address: web3.utils.toChecksumAddress(userAddress),
    });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const tickets = await Tickets.find({
      raffle: raffleId,
      user: user._id,
    })
      .populate("raffle")
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

// Purchase raffle tickets
exports.purchaseTickets = async (req, res) => {
  const { raffleId } = req.params;
  const { address, quantity } = req.body;

  try {
    // Lookup raffle
    const raffle = await Raffles.findById(raffleId);
    if (!raffle) {
      return res.status(404).send({
        success: false,
        message: "Raffle not found",
      });
    }

    // Check raffle expiry
    if (raffle.expiry < Date.now()) {
      return res.status(400).send({
        success: false,
        message: "Raffle has expired",
      });
    }

    // Lookup user
    const user = await Users.findOne({
      address: web3.utils.toChecksumAddress(address),
    });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (user.banned) {
      return res.status(400).send({
        success: false,
        message: "You are restricted from performing this action",
      });
    }

    // Make sure sure does not purchase more than 5 tickets for a raffle. Check if user has already purchased tickets for this raffle
    const userTickets = await Tickets.find({
      raffle: raffleId,
      user: user._id,
    });

    if (userTickets.length + quantity > 5) {
      return res.status(400).send({
        success: false,
        message: "Cannot purchase more than 5 tickets for a raffle",
      });
    }

    // if (user.points < raffle.price * quantity) {
    //   return res.status(400).send({
    //     message: "Not enough $STRIPE to purchase tickets",
    //   });
    // }

    // Check number of tickets requested
    if (quantity > raffle.maxTickets - user.tickets.length) {
      return res.status(400).send({
        success: false,
        message: "Purchase exceeds max tickets",
      });
    }

    // Check enough tickets available
    if (quantity > raffle.maxTickets - raffle.ticketsSold) {
      return res.status(400).send({
        success: false,
        message: "Not enough tickets remaining",
      });
    }

    // Generate new purchaseId
    const purchaseId = new ObjectId();

    // Create tickets with same purchaseId
    const newTickets = [];

    for (let i = 0; i < quantity; i++) {
      const ticket = await Tickets.create({
        raffle: raffle._id,
        user: user._id,
        purchaseId,
      });

      newTickets.push(ticket);
    }

    // Update raffle tickets sold
    raffle.ticketsSold += newTickets.length;
    await raffle.save();

    // Add tickets to user's tickets array
    user.tickets.push(...newTickets);
    await user.save();

    res.status(201).json({
      success: true,
      data: newTickets,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to purchase tickets",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { item, price, expiry, maxTickets } = req.body;

    // Validate required fields
    if (!item || !price || !expiry || !maxTickets) {
      // return res.status(400).send({
      //   success: false,
      //   message: "Required fields missing",
      // });
      if (!item) {
        return res.status(400).send({
          success: false,
          message: "Item field is missing",
        });
      }

      if (!maxTickets) {
        return res.status(400).send({
          success: false,
          message: "Max tickets field is missing",
        });
      }

      if (!price) {
        return res.status(400).send({
          success: false,
          message: "Price field is missing",
        });
      }

      if (!expiry) {
        return res.status(400).send({
          success: false,
          message: "Expiry field is missing",
        });
      }

      return res.status(400).send({
        success: false,
        message: "Required fields missing",
      });
    }

    // Validate expiry date
    if (expiry * 1000 <= Date.now()) {
      return res.status(400).send({
        success: false,
        message: "Expiry date must be in future",
      });
    }

    // Create and save raffle
    const raffle = await Raffles.create({
      item,
      price,
      expiry: new Date(expiry * 1000),
      maxTickets,
    });

    res.status(201).send({
      success: true,
      data: raffle,
      message: "Raffle created successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
    });
  }
};

exports.history = async (req, res) => {
  try {
    const history = await Raffles.aggregate([
      {
        $lookup: {
          from: "tickets",
          localField: "_id",
          foreignField: "raffle",
          as: "tickets",
        },
      },
      {
        $unwind: "$tickets",
      },
      {
        $lookup: {
          from: "users",
          localField: "tickets.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: {
            raffleId: "$_id",
            purchaseId: "$tickets.purchaseId",
          },
          address: { $first: "$user.address" },
          time: { $max: "$tickets.purchasedAt" },
          amount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.raffleId",
          history: {
            $push: {
              address: "$address",
              amount: "$amount",
              time: "$time",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          raffleId: "$_id",
          history: 1,
        },
      },
    ]);

    // Transform the data into the requested format
    const result = history.reduce((res, item) => {
      res[item.raffleId] = item.history;
      return res;
    }, {});

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get history" });
  }
};
