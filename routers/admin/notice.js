const express = require("express");
const router = express.Router();

const noticeController = require("../../controllers/admin/notice.admin.controller");
const { validator } = require("../../middlewares/exporess-validator");
const { body } = require("express-validator");

router.get("/", noticeController.getNotices);
router.post(
  "/",
  [
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("writer").notEmpty(),
    validator,
  ],
  noticeController.sendNoticeAndPushNotificationToEveryone
);

module.exports = router;
