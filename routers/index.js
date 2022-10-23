const express = require("express");
const router = express.Router();

const mealRouter = require("./meal");

router.use("/meal", mealRouter);

module.exports = router;
