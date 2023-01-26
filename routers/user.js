const express = require("express");
const router = express.Router();

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");
const { body } = require("express-validator");
const { validator } = require("../middlewares/exporess-validator");
const userController = require("../controllers/user.controller");

router.get("/info", checkToken, userController.getUserInfo);

router.post(
  "/modify/userInfo",
  checkToken,
  [
    body("grade").notEmpty(),
    body("class").notEmpty(),
    body("number").notEmpty(),
    validator,
  ],
  userController.modifyUserInfo
);

router.post(
  "/upload/photo",
  checkToken,
  uploader.single("image"),
  userController.registerPhoto
);

router.post(
  "/register/barcode",
  [body("barcode").notEmpty(), validator],
  checkToken,
  userController.registerBarCode
);

module.exports = router;