const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const mealRouter = require("./meal");
const feedRouter = require("./feed");
const communityRouter = require("./community");
const bannerRouter = require("./banner");
const pushNotiRouter = require("./push-noti");
const noticeRouter = require("./notice");

router.use("/auth", authRouter);
router.use("/meal", mealRouter);
router.use("/feed", feedRouter);
router.use("/community", communityRouter);
router.use("/banner", bannerRouter);
router.use("/push-noti", pushNotiRouter);
router.use("/notice", noticeRouter);

module.exports = router;
