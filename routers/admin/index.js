const express = require("express");
const router = express.Router();

const noticeRouter = require("./notice");
const pushNotiRouter = require("./push-noti");

router.use("/notice", noticeRouter);
router.use("/push-noti", pushNotiRouter);

module.exports = router;
