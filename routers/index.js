const express = require("express");
const router = express.Router();

const adminRouter = require("./admin");
const authRouter = require("./auth");
const userRouter = require("./user");
const mealRouter = require("./meal");
const feedRouter = require("./feed");
const communityRouter = require("./community");
const bannerRouter = require("./banner");
const pushNotiRouter = require("./push-noti");
const noticeRouter = require("./notice");

router.use("/admin", adminRouter); //TODO: 관리자인지 확인하는 로직 추가
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/meal", mealRouter);
router.use("/feed", feedRouter);
router.use("/community", communityRouter);
router.use("/banner", bannerRouter);
router.use("/push-noti", pushNotiRouter);
router.use("/notice", noticeRouter);

module.exports = router;
