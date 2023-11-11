const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const userRouter = require("./user");
const mealRouter = require("./meal");
const feedRouter = require("./feed");
const communityRouter = require("./community");
const bannerRouter = require("./banner");
const pushNotiRouter = require("./push-noti");
const photoRouter = require("./photo");
const noticeRouter = require("./notice");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/meal", mealRouter);
router.use("/feed", feedRouter);
router.use("/community", communityRouter);
router.use("/banner", bannerRouter);
router.use("/push-noti", pushNotiRouter);
router.use("/photo", photoRouter);
router.use("/notice", noticeRouter);

module.exports = router;
