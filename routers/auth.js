const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.post("/join", authController.join);
router.post("/code", authController.requestCode);
router.post("/verify/code", authController.validateCode);
router.post("/verify/registerCode", authController.validateRegisterCode);

module.exports = router;
