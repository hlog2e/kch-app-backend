const express = require("express");
const router = express.Router();

const photoController = require("../controllers/photo.controller");
const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

router.get(
  "/",
  [query("limit").notEmpty(), query("skip").notEmpty(), validator],
  photoController.getPhotos
);

module.exports = router;
