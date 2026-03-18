const express = require("express");
const router = express.Router();

const uploader = require("../middlewares/multer");
const { checkToken, checkAdmin } = require("../middlewares/auth");
const { body } = require("express-validator");
const { validator } = require("../middlewares/exporess-validator");
const userController = require("../controllers/user.controller");
const verifyController = require("../controllers/verify.controller");

router.get("/info", checkToken, userController.getUserInfo);

// -------- 인증 요청 --------
router.post(
  "/verify",
  checkToken,
  uploader.single("image"),
  verifyController.requestVerification
);
router.get("/verify/status", checkToken, verifyController.getMyVerificationStatus);

// -------- [관리자] 인증 관리 --------
router.get("/verify/pending", checkAdmin, verifyController.getPendingRequests);
router.post("/verify/:requestId/approve", checkAdmin, verifyController.approveRequest);
router.post("/verify/:requestId/reject", checkAdmin, verifyController.rejectRequest);

router.post(
  "/editProfile",
  checkToken,
  [body("name").notEmpty(), body("desc").notEmpty(), validator],
  userController.editUserInfo
);

router.post(
  "/upload/profilePhoto",
  checkToken,
  uploader.single("image"),
  userController.registerProfilePhoto
);

router.post(
  "/delete/profilePhoto",
  checkToken,
  userController.deleteProfilePhoto
);

router.post(
  "/upload/idPhoto",
  checkToken,
  uploader.single("image"),
  userController.registerIdPhoto
);

router.post(
  "/register/barcode",
  [body("barcode").notEmpty(), validator],
  checkToken,
  userController.registerBarCode
);

router.get(
  "/notificationSetting",
  checkToken,
  userController.getCurrentNotificationSetting
);

router.post(
  "/notificationSetting",
  [body("category").notEmpty(), body("isRegister").notEmpty(), validator],
  checkToken,
  userController.postUpdateNotificationSetting
);

router.post(
  "/reset-block-users",
  checkToken,
  userController.resetBlockUserList
);

router.get("/timetable", checkToken, userController.getMyTimetable);

router.post(
  "/timetable",
  [body("timetable").notEmpty(), validator],
  checkToken,
  userController.postMyTimetable
);

module.exports = router;
