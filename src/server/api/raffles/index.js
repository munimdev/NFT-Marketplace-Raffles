const express = require("express");
const router = express.Router();
const raffles = require("./controller");

router.get("/dummy", raffles.dummy);
router.get("/all", raffles.getAllRaffles);
router.get("/:raffleId/tickets/:userAddress", raffles.getRaffleTicketsByUser);
router.post("/:raffleId/purchase", raffles.purchaseTickets);
router.post("/create", raffles.create);
router.get("/history", raffles.history);

// router.post("/info", raffles.info);
// router.get("/dummy", raffles.dummy);

router.get("/test", (req, res) => {
  console.log("raffles/test");
  res.status(200).send("ok");
});

module.exports = router;
