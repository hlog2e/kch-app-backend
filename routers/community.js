const express = require("express");
const router = express.Router();

const communityController = require("../controllers/community.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query, body } = require("express-validator");

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");

router.get("/board", checkToken, communityController.getCommunityBoards);
router.get(
  "/board/fixed",
  checkToken,
  communityController.getCommunityBoardFixed
);
router.post(
  "/board/fix",
  checkToken,
  communityController.postCommunityBoardFix
);
router.post(
  "/board/unFix",
  checkToken,
  communityController.postCommunityBoardUnFix
);

router.get(
  "",
  checkToken,
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
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

router.get("/blockedUsers", checkToken, communityController.getBlockedUsers);
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
  [body("commentId").notEmpty(), validator],
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

router.post(
  "/checkBadWord",
  [body("text").notEmpty(), validator],
  communityController.checkBadWord
);

module.exports = router;
