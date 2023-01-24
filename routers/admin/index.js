const express = require("express");
const router = express.Router();

const noticeRouter = require("./notice");
const pushNotiRouter = require("./push-noti");
const registerCodeRouter = require("./register-code");

router.use("/notice", noticeRouter);
router.use("/push-noti", pushNotiRouter);
router.use("/register-code", registerCodeRouter);

module.exports = router;
