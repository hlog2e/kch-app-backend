const express = require("express");
const router = express.Router();

const registerCodeController = require("../../controllers/admin/register-code.admin.controller");

const { validator } = require("../../middlewares/exporess-validator");
const { body } = require("express-validator");

router.post(
  "/many",
  [body("amount").notEmpty(), validator],
  registerCodeController.createRegisterCodeMany
);

module.exports = router;
