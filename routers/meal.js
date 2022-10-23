const express = require("express");
const router = express.Router();

const mealController = require("../controllers/meal.controller");

router.get("/", mealController.getMealbyDate);

module.exports = router;
