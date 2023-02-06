const express = require("express");
const router = express.Router();

const communityController = require("../controllers/community.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query, body } = require("express-validator");

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");

router.get(
  "",
  checkToken,
  [
    query("offset").notEmpty(),
    query("limit").notEmpty(),
    query("sort").notEmpty(),
    validator,
  ],
  communityController.getCommunityItems
);
router.post(
  "",
  checkToken,
  uploader.array("image"),
  communityController.postCommunityItemWithImageUploader
);

router.get(
  "/detail",
  checkToken,
  [query("id").notEmpty(), validator],
  communityController.getCommunityDetail
);

router.get(
  "/mine",
  checkToken,
  communityController.getCommunitiesWrittenByUser
);

router.get("/blocked_users", checkToken, communityController.getBlockedUsers);
router.post(
  "/block_user",
  checkToken,
  [body("blockUserId").notEmpty(), validator],
  communityController.postBlockUser
);

router.post(
  "/report",
  checkToken,
  [body("postId").notEmpty(), validator],
  communityController.postReportCommunityItem
);
router.post(
  "/report/comment",
  checkToken,
  [body("postId").notEmpty(), body("commentId").notEmpty(), validator],
  communityController.postReportComment
);

router.post(
  "/comment",
  [body("communityId").notEmpty(), body("comment").notEmpty(), validator],
  checkToken,
  communityController.postComment
);

router.delete(
  "/comment",
  [body("communityId").notEmpty(), body("commentId").notEmpty(), validator],
  checkToken,
  communityController.deleteComment
);

router.post(
  "/like",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityController.addLike
);
router.delete(
  "/like",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityController.deleteLike
);
router.delete(
  "",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityController.deleteCommunity
);

module.exports = router;
