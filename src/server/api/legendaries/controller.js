const db = require("../../db");
const Legendary = db.Legendary;
const User = db.User;
const Numbers = db.Numbers;
const auctionListData = require("./auctionListData.json");
const mongoose = require("mongoose");
const updateData = require("./updateData.json");
var ObjectId = require("mongodb").ObjectID;

exports.createList = (req, res) => {
  auctionListData.map((auctionItem, index) => {
    const params = {
      name: auctionItem.name,
      dataURL: auctionItem.dataURL,
      description: auctionItem.description,
      tokenId: auctionItem.tokenId,
      isVisible: 1,
    };
    const res = _updateItem(params);
    console.log(`res[${index}] = `, JSON.stringify(res));
  });
  console.log("Created End");
  return res.status(200).send("Created End");
};

exports.updateItem = (req, res) => {
  updateData.map((newItem, index) => {
    const params = newItem;
    _updateItem(params);
  });
  return res.status(200).send("Item updated successfully");
};

exports.updateMintStatus = (req, res) => {
  const { tokenId, status } = req.body;
  console.log("tokenId=", tokenId, "status=", status);
  Legendary.find({ tokenId: tokenId })
    .then(async (docs) => {
      if (docs.length === 0) {
        return res.status(200).send("Item not found");
      } else {
        if (!mongoose.Types.ObjectId.isValid(docs[0]._id))
          return { success: false, msg: `No task with id :${docs[0]._id}` };
        // update item
        Legendary.findByIdAndUpdate(
          mongoose.Types.ObjectId(docs[0].id.trim()),
          {
            isMinted: status,
          },
          { useFindAndModify: false }
        )
          .then((data) => {
            return res.status(200).send("Item updated successfully");
          })
          .catch((err) => {
            return res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((err) => {
      return res.status(500).send("Internal Server Error");
    });
};

const _updateItem = (params) => {
  const item = new Legendary({ ...params });
  Legendary.find({ tokenId: params.tokenId })
    .then(async (docs) => {
      if (docs.length === 0) {
        // create new item
        await item.save();
        console.log("create new item, tokenId=", params.tokenId);
      } else {
        if (!mongoose.Types.ObjectId.isValid(docs[0]._id))
          return { success: false, msg: `No task with id :${docs[0]._id}` };
        // update item
        Legendary.findByIdAndUpdate(
          mongoose.Types.ObjectId(docs[0].id.trim()),
          {
            ...params,
          },
          { useFindAndModify: false }
        )
          .then((data) => {
            // console.log("update item, tokenId=", params.tokenId, "data=", data);
            if (!data) return { success: false };
            return { success: true };
          })
          .catch((err) => {
            // console.log("update item, tokenId=", params.tokenId, "err=", err);
            return { success: false };
          });
      }
      return {
        success: true,
      };
    })
    .catch((err) => {
      return {
        success: false,
        error: err,
      };
    });
};

exports.startAuction = (req, res) => {
  let tokenId = req.body.tokenId;
  const auctionStarted = Math.floor(new Date().getTime() / 1000);
  const auctionPeriod = req.body.auctionPeriod;
  const params = {
    auctionStarted: auctionStarted,
    auctionPeriod: auctionPeriod,
  };

  Legendary.findOneAndUpdate(
    { tokenId
    },
    {
      $set: params,
    },
    { useFindAndModify: false }
  )
    .then((data) => {
      return res.status(200).send({ success: true, data: "Auction started successfully" });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.getList = (req, res) => {
  let query = {};
  Legendary.find(query)
    .sort({ auctionStarted: -1, tokenId: 1 })
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.getItemByTokenID = (req, res) => {
  let tokenId = req.params.tokenId;
  Legendary.findOne({
    tokenId: tokenId,
  })
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.purchaseNFT = async (req, res) => {
  const { tokenId, username, price } = req.body;
  console.log("purchaseNFT", tokenId, username, price);
  try {
    const legendary = await Legendary.findOne({ tokenId: tokenId });
    const auctionEndTime = (legendary.auctionStarted + legendary.auctionPeriod) * 1000;
    console.log("auctionEndTime", auctionEndTime);
    const currentTime = Date.now();
    console.log("currentTime", currentTime);
    if (currentTime > auctionEndTime) {
      let bids = legendary.bids;
      // sort the bids in descending order
      bids.sort((a, b) => b.price - a.price);
      // get the highest bid
      const highestBid = bids[0];
      console.log(highestBid);
      // fetch the user who placed the highest bid and subtract the bid amount from their balance
      const user = await User.findOne({ username: highestBid.username });
      console.log(user);
      const newBalance = user.yem - highestBid.price;

      // update the user's balance
      await Promise.all([
        await User.findByIdAndUpdate(user._id, {
          $set: {
            yem: newBalance,
          },
        }),
        await User.findByIdAndUpdate(user._id, {
          $push: {
            mintedNFTs: {
              tokenId: legendary.tokenId,
              name: legendary.name,
              dataURL: legendary.dataURL,
              description: legendary.description,
              price: legendary.price,
            }
          },
        }),
        // mark the auction as isSold
        await Legendary.findByIdAndUpdate(legendary._id, {
          $set: {
            isSold: 1,
          },
        })
      ]);
      return res.status(200).send({ success: true, data: legendary });
    } else {
      return res.status(400).send({ success: false, message: "Auction is not ended" });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send({ success: false, message: "NFT not found" });
  }
};

exports.switchMintingStatus = (req, res) => {
  Numbers.findOne({
    name: "minted",
  })
    .then((data) => {
      if (data.value === 0) {
        Numbers.findByIdAndUpdate(data._id, {
          $set: {
            value: 1,
          },
        })
          .then((data) => {
            return res.status(200).send({ success: true, data });
          })
          .catch((err) => {
            return res
              .status(500)
              .send({ success: false, message: "Internal Server Error" });
          });
      } else {
        Numbers.findByIdAndUpdate(data._id, {
          $set: {
            value: 0,
          },
        })
          .then((data) => {
            return res.status(200).send({ success: true, data });
          })
          .catch((err) => {
            return res
              .status(500)
              .send({ success: false, message: "Internal Server Error" });
          });
      }
    })
  };

  exports.getMintingStatus = (req, res) => {
    Numbers.findOne({
      name: "minted",
    })
      .then((data) => {
        return res.status(200).send({ success: true, data });
      })
      .catch((err) => {
        return res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      });
  };

  exports.fetchNumber = (req, res) => {
    const { name } = req.body;
    Numbers.findOne({
      name: name,
    })
      .then((data) => {
        return res.status(200).send({ success: true, data });
      })
      .catch((err) => {
        return res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      });
  };
  
  exports.setNumber = (req, res) => {
    const { name, value } = req.body;
    Numbers.findOne({
      name: name,
    })
      .then((data) => {
        Numbers.findByIdAndUpdate(data._id, {
          $set: {
            value: value,
          },
        })
          .then((data) => {
            return res.status(200).send({ success: true, data });
          })
          .catch((err) => {
            return res
              .status(500)
              .send({ success: false, message: "Internal Server Error" });
          });
      })
      .catch((err) => {
        return res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      });
  };


// exports.purchaseNFT = (req, res) => {
//   const { tokenId, username, price } = req.body;
//   Legendary.findOne({
//     tokenId: tokenId,
//   })
//     .then((data) => {
//       let bids = data.bids;
//       // make sure the auction has ended. if it has, mark the auction as isSold
//       if ((data.auctionStarted + data.auctionPeriod) * 1000 < Date.now()) {
//         Legendary.findByIdAndUpdate(data._id, {
//           $set: {
//             isSold: 1,
//           },
//         })
//           .then((data) => {
//             return res.status(200).send({ success: true, data });
//           })
//           .catch((err) => {
//             return res
//               .status(500)
//               .send({ success: false, message: "Internal Server Error" });
//           });
//       } else {
//         return res
//           .status(500)
//           .send({ success: false, message: "Auction is not ended" });
//       }
//     })
//     .catch((err) => {
//       return res
//         .status(500)
//         .send({ success: false, message: "Internal Server Error" });
//     });
// };

exports.inactive = (req, res) => {
  let query = { auctionStarted: { $eq: 0 } };
  Legendary.find(query)
    .then((data) => {
      return res.status(200).send({ success: true, data });
    })
    .catch((err) => {
      return res
        .status(500)
        .send({ success: false, message: "Internal Server Error" });
    });
};

exports.setBid = (req, res) => {
  let itemId = req.body.itemId;
  let userId = req.body.userId;
  let username = req.body.username;
  let address = req.body.address;
  let price = req.body.price;
  Legendary.findById(itemId)
    .then((data) => {
      let bids = data.bids;
      if ((data.auctionStarted + data.auctionPeriod) * 1000 >= Date.now()) {
        if (bids.length === 0 || bids[bids.length - 1].price < price) {
          bids.push({
            user_id: ObjectId(userId),
            username: username,
            address: address,
            price: price,
            Time: Date.now(),
          });
          const newbids = bids;
          Legendary.findByIdAndUpdate(itemId, {
            bids: newbids,
            price: price,
            lastPrice: price,
          })
            .then(() => {
              return res.send({ code: 0, data: newbids, message: "Successfully placed a bid!" });
            })
            .catch(() => {
              return res.send({ code: 2, data: [], message: "Update error!" });
            });
        } else {
          return res.send({
            code: 2,
            data: [],
            message: "Price must be higher than prev bids!",
          });
        }
      } else {
        return res.send({ code: 2, data: [], message: "Auction ended!" });
      }
    })
    .catch((error) => {
      return res.send({ code: 1, data: [], message: error });
    });
};

exports.getHotBids = (req, res) => {
  let limit = req.body.limit ? Number(req.body.limit) : 3;
  Legendary.aggregate([
    {
      $unwind: "$bids",
    },
    {
      $group: { _id: "$_id", maxValue: { $max: "$bids.price" } },
    },
    { $sort: { maxValue: -1 } },
    {
      $lookup: {
        from: "legendaries",
        localField: "_id",
        foreignField: "_id",
        as: "info",
      },
    },
  ])
    .limit(limit)
    .then((data) => {
      return res.send({ code: 0, list: data });
    })
    .catch((error) => {
      return res.send({ code: 1, list: [] });
    });
};
