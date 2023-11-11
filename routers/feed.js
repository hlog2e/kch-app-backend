const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feed.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query, body } = require("express-validator");

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");

router.get(
  "",
  checkToken,
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
  feedController.getFeedItems
);

router.post(
  "/",
  checkToken,
  uploader.array("image"),
  feedController.postFeedWithImageUploader
);

router.post(
  "/delete",
  checkToken,
  [body("feedId").notEmpty(), validator],
  feedController.deleteFeed
);
module.exports = router;
