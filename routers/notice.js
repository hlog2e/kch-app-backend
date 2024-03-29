const express = require("express");
const router = express.Router();

const noticeController = require("../controllers/notice.controller");
const { validator } = require("../middlewares/exporess-validator");
const { query } = require("express-validator");

router.get(
  "/",
  [query("limit").notEmpty(), query("skip").notEmpty(), validator],
  noticeController.getNotices
);

router.get(
  "/detail",
  [query("noticeId").notEmpty(), validator],
  noticeController.getNoticeDetail
);

module.exports = router;
