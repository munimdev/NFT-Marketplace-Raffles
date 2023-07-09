const express = require("express");
const router = express.Router();
const legendaries = require("./controller");

router.get("/create_list", legendaries.createList);
router.get("/get_list", legendaries.getList);
router.post("/set_bid", legendaries.setBid);
router.post("/get_hod_bids", legendaries.getHotBids);
router.get("/update_item", legendaries.updateItem);
router.get("/get/:tokenId", legendaries.getItemByTokenID);
router.get("/inactive", legendaries.inactive);
router.post("/start", legendaries.startAuction);
router.post("/purchase", legendaries.purchaseNFT);
router.post("/switch", legendaries.switchMintingStatus);
router.get("/status", legendaries.getMintingStatus);
router.post("/fetch", legendaries.fetchNumber);
router.post("/update", legendaries.setNumber);
router.post("/updateMintStatus", legendaries.updateMintStatus);

module.exports = router;