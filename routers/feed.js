const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feed.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

const uploader = require("../middlewares/multer");

router.get(
  "",
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
  feedController.getFeedItems
);
router.post(
  "/image",
  uploader.single("image"),
  feedController.uploadSingleFileToS3
);

module.exports = router;
