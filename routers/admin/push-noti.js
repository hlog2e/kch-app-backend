const express = require("express");
const router = express.Router();

const pushNotiController = require("../../controllers/admin/push-noti.admin.controller");
const { validator } = require("../../middlewares/exporess-validator");
const { body } = require("express-validator");

router.post(
  "/everyone",
  [body("title").notEmpty(), body("message").notEmpty(), validator],
  pushNotiController.sendNotificationToEveryone
);

module.exports = router;