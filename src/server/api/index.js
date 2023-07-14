const express = require("express");

// Yourmey
const users = require("./users");
const raffles = require("./raffles");

const checkAuthentication = require("./private_router");

const router = express.Router();

router.use("/users", checkAuthentication, users);
router.use("/raffles", checkAuthentication, raffles);

module.exports = router;
