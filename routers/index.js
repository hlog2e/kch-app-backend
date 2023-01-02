const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const mealRouter = require("./meal");
const feedRouter = require("./feed");
const communityRouter = require("./community");

router.use("/auth", authRouter);
router.use("/meal", mealRouter);
router.use("/feed", feedRouter);
router.use("/community", communityRouter);

module.exports = router;
