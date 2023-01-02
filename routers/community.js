const express = require("express");
const router = express.Router();

const communityController = require("../controllers/community.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

const uploader = require("../middlewares/multer");
const feedController = require("../controllers/feed.controller");

router.get(
  "",
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
  communityController.getCommunityItems
);

module.exports = router;
