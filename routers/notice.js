const express = require("express");
const router = express.Router();

const noticeController = require("../controllers/notice.controller");

router.get("/", noticeController.getNotices);

module.exports = router;
