const express = require("express");
const router = express.Router();

const authController = require("../../controllers/admin/auth.admin.controller");
const { validator } = require("../../middlewares/exporess-validator");
const { body } = require("express-validator");

router.post(
  "/login",
  [body("id").notEmpty(), body("pw").notEmpty(), validator],
  authController.login
);

module.exports = router;
