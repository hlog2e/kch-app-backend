const express = require("express");
const router = express.Router();

const { validator } = require("../../middlewares/exporess-validator");
const { query } = require("express-validator");

const userController = require("../../controllers/admin/user.admin.controller");

router.get("/gradeAndClass", [
  query("grade").notEmpty(),
  query("class").notEmpty(),
  validator,
  userController.getStudentByGradeAndClass,
]);

module.exports = router;
