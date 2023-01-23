const express = require("express");
const router = express.Router();

const pushNotiController = require("../controllers/push-noti.controller");
const { validator } = require("../middlewares/exporess-validator");
const { body } = require("express-validator");
const { checkToken } = require("../middlewares/auth");

router.post(
  "/register",
  [body("token").notEmpty(), validator],
  checkToken,
  pushNotiController.registerPushToken
);

module.exports = router;
