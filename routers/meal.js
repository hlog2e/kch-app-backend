const express = require("express");
const router = express.Router();

const mealController = require("../controllers/meal.controller");
const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

router.get(
  "/",
  [query("date").notEmpty(), query("limit").notEmpty(), validator],
  mealController.getMealbyDate
);

module.exports = router;
