const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validator } = require("../middlewares/exporess-validator");

const authController = require("../controllers/auth.controller");

router.post(
  "/login",
  [
    body("phoneNumber")
      .trim()
      .isInt()
      .notEmpty()
      .isLength({ min: 11, max: 11 }),
    body("code").trim().notEmpty().isInt().isLength({ min: 4, max: 4 }),
    validator,
  ],
  authController.login
);
router.post(
  "/join",
  [
    body("phoneNumber")
      .trim()
      .isInt()
      .notEmpty()
      .isLength({ min: 11, max: 11 }),
    body("name").notEmpty(),
    body("grade").isInt().notEmpty().isLength({ min: 1, max: 1 }),
    body("number").isInt().optional({ nullable: true }),
    body("registerCode").notEmpty().isLength({ min: 5, max: 5 }),
    validator,
  ],
  authController.join
);
router.post(
  "/code",
  [
    body("phoneNumber")
      .trim()
      .isInt()
      .notEmpty()
      .isLength({ min: 11, max: 11 }),
    body("type").notEmpty(),

    validator,
  ],
  authController.requestCode
);
router.post(
  "/verify/code",
  [
    body("phoneNumber")
      .trim()
      .isInt()
      .notEmpty()
      .isLength({ min: 11, max: 11 }),
    body("code").trim().notEmpty().isInt().isLength({ min: 4, max: 4 }),
    validator,
  ],
  authController.validateCode
);
router.post(
  "/verify/registerCode",
  body("registerCode").notEmpty().isLength({ min: 5, max: 5 }),
  [validator],
  authController.validateRegisterCode
);

module.exports = router;
