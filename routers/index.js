const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const mealRouter = require("./meal");

router.use("/auth", authRouter);
router.use("/meal", mealRouter);

module.exports = router;
