const express = require("express");
const router = express.Router();

const feedController = require("../../controllers/admin/feed.admin.controller");
const uploader = require("../../middlewares/multer");
const { body } = require("express-validator");
const { validator } = require("../../middlewares/exporess-validator");

router.get("/", feedController.getFeedItems);
router.post(
  "/",
  uploader.array("image"),
  feedController.postFeedWithImageUploader
);
router.delete(
  "/",
  [body("feedId").notEmpty(), validator],
  feedController.deleteFeed
);

module.exports = router;
