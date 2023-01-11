const express = require("express");
const router = express.Router();

const bannerController = require("../controllers/banner.controller");
//const { validator } = require("../middlewares/exporess-validator");

router.get("/", bannerController.getBanners);

module.exports = router;
