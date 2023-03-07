const express = require("express");
const router = express.Router();

const noticeRouter = require("./notice");
const pushNotiRouter = require("./push-noti");
const registerCodeRouter = require("./register-code");
const authRouter = require("./auth");
const userRouter = require("./user");
const feedRouter = require("./feed");

const { checkAdmin } = require("../../middlewares/auth");

router.use("/notice", checkAdmin, noticeRouter);
router.use("/push-noti", checkAdmin, pushNotiRouter);
router.use("/register-code", checkAdmin, registerCodeRouter);
router.use("/auth", authRouter);
router.use("/user", checkAdmin, userRouter);
router.use("/feed", checkAdmin, feedRouter);

module.exports = router;
