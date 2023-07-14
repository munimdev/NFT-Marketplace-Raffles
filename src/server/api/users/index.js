const express = require("express");
const router = express.Router();
const users = require("./controller");

router.post("/create", users.create);
router.post("/info", users.info);
router.get("/all", users.getAllUsers);

router.get("/test", (req, res) => {
  console.log("users/test");
  res.status(200).send("ok");
});

module.exports = router;
