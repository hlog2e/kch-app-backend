const express = require("express");
const router = express.Router();

const feedController = require("../../controllers/admin/feed.admin.controller");
const uploader = require("../../middlewares/multer");

router.get("/", feedController.getFeedItems);
router.post(
  "/",
  uploader.array("image"),
  feedController.postFeedWithImageUploader
);

module.exports = router;
