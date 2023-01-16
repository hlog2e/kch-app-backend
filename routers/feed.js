const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feed.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");

router.get(
  "",
  checkToken,
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
  feedController.getFeedItems
);

module.exports = router;
