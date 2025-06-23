const express = require("express");
const router = express.Router();

const communityV2Controller = require("../controllers/community-v2.controller");

const { validator } = require("../middlewares/exporess-validator");
const { query, body } = require("express-validator");

const uploader = require("../middlewares/multer");
const { checkToken } = require("../middlewares/auth");

// v2: 카테고리 목록 조회
router.get("/categories", checkToken, communityV2Controller.getCategories);

// v2: 커뮤니티 아이템 조회 (카테고리 필터링 지원)
router.get(
  "",
  checkToken,
  [query("offset").notEmpty(), query("limit").notEmpty(), validator],
  communityV2Controller.getCommunityItems
);

// v2: 커뮤니티 글 작성 (카테고리 포함)
router.post(
  "",
  checkToken,
  uploader.array("image"),
  [body("title").notEmpty(), body("content").notEmpty(), validator],
  communityV2Controller.postCommunityItemWithImageUploader
);

// v2: 커뮤니티 상세 조회
router.get(
  "/detail",
  checkToken,
  [query("id").notEmpty(), validator],
  communityV2Controller.getCommunityDetail
);

// v2: 내가 작성한 커뮤니티 글 조회 (카테고리 필터링 지원)
router.get(
  "/mine",
  checkToken,
  communityV2Controller.getCommunitiesWrittenByUser
);

// 나머지 기능들은 v1과 동일하므로 재사용
router.get("/blockedUsers", checkToken, communityV2Controller.getBlockedUsers);
router.post(
  "/block_user",
  checkToken,
  [body("blockUserId").notEmpty(), validator],
  communityV2Controller.postBlockUser
);

router.post(
  "/report",
  checkToken,
  [body("postId").notEmpty(), validator],
  communityV2Controller.postReportCommunityItem
);
router.post(
  "/report/comment",
  checkToken,
  [body("commentId").notEmpty(), validator],
  communityV2Controller.postReportComment
);

router.post(
  "/comment",
  [body("communityId").notEmpty(), body("comment").notEmpty(), validator],
  checkToken,
  communityV2Controller.postComment
);

router.delete(
  "/comment",
  [body("communityId").notEmpty(), body("commentId").notEmpty(), validator],
  checkToken,
  communityV2Controller.deleteComment
);

router.post(
  "/like",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityV2Controller.addLike
);
router.delete(
  "/like",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityV2Controller.deleteLike
);
router.delete(
  "",
  [body("communityId").notEmpty(), validator],
  checkToken,
  communityV2Controller.deleteCommunity
);

module.exports = router;
