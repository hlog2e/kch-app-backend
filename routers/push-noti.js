const express = require("express");
const router = express.Router();

const pushNotiController = require("../controllers/push-noti.controller");
const { validator } = require("../middlewares/exporess-validator");
const { body } = require("express-validator");
const { checkToken } = require("../middlewares/auth");

router.post(
  "/register",
  [body("token").notEmpty(), validator],
  checkToken,
  pushNotiController.registerPushToken
);

router.post(
  "/unRegister",
  [body("token").notEmpty(), validator],
  checkToken,
  pushNotiController.unRegisterPushToken
);

router.post(
  "/sendEveryone",
  [
    body("title").notEmpty(),
    body("message").notEmpty(),
    body("link").notEmpty(),
    body("password").notEmpty(),
    validator,
  ],
  pushNotiController.sendNotificationToEveryone
);

module.exports = router;
