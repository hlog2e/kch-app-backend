const express = require("express");
const router = express.Router();

const registerCodeController = require("../../controllers/admin/register-code.admin.controller");

const { validator } = require("../../middlewares/exporess-validator");
const { body, query } = require("express-validator");

router.get("/info", registerCodeController.getRegisterCodeInfo);
router.get(
  "/",
  [query("isUsed").notEmpty(), validator],
  registerCodeController.getRegisterCodes
);
router.post(
  "/many",
  [body("amount").notEmpty(), validator],
  registerCodeController.createRegisterCodeMany
);

module.exports = router;
