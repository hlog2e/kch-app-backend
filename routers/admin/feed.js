const express = require("express");
const router = express.Router();

const feedController = require("../../controllers/admin/feed.admin.controller");

router.get("/", feedController.getFeedItems);

module.exports = router;
