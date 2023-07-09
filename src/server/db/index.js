const dbConfig = require("./config");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.Raffle = require("./raffle.model")(mongoose);
db.RaffleItem = require("./raffleItem.model")(mongoose);
db.Settings = require("./settings.model")(mongoose);
db.Ticket = require("./ticket.model")(mongoose);
db.User = require("./users.model")(mongoose);

module.exports = db;
