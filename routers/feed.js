const express = require("express");
const router = express.Router();

const feedController = require("../controllers/feed.controller")

const uploader = require("../middlewares/multer")

router.post("/image", uploader.single('image'), feedController.uploadSingleFileToS3);

module.exports = router;
