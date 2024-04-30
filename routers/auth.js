const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validator } = require("../middlewares/exporess-validator");

const authController = require("../controllers/auth.controller");

router.post(
  "/code",
  [body("phoneNumber").notEmpty(), validator],
  authController.requestCode
);
router.post(
  "/verifyCode",
  [body("phoneNumber").notEmpty(), body("code").notEmpty(), validator],
  authController.verifyCodeAndLogin
);
router.post(
  "/join",
  [
    body("phoneNumber").notEmpty(),
    body("code").notEmpty(),
    body("type").notEmpty(),
    body("name").notEmpty(),

    validator,
  ],
  authController.join
);
router.post(
  "/verifyUndergraduate",
  [body("barcode").notEmpty()],
  validator,
  authController.verifyUndergradute
);

module.exports = router;
