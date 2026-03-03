const Communities = require("../models/community");
const CommunityComment = require("../models/communityComment");
const User = require("../models/user");
const PushToken = require("../models/pushToken");

const {
  sendNotification,
  sendNotificationByCategory,
} = require("../utils/expo-notifications");

module.exports = {
  // v2: boardId 없이 카테고리 기반으로 커뮤니티 아이템 조회
  getCommunityItems: async (req, res) => {
    const { offset = 0, limit = 20, category } = req.query;
    const userId = req.userId;

    try {
      const { blockedUsers } = await User.findOne({ _id: userId });

      // 기본 쿼리 조건
      let queryConditions = {
        status: "normal",
        publisher: { $nin: blockedUsers }, // 차단한 유저의 게시물은 제외
      };

      // 카테고리 필터링 (카테고리가 지정된 경우)
      if (category) {
        queryConditions.category = category;
      }

      const data = await Communities.find(queryConditions)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ createdAt: -1 });

      const totalCount = await Communities.countDocuments(queryConditions);

      res.json({
        status: 200,
        message: "정상 처리 되었습니다.",
        communities: data,
        totalCount: totalCount,
        nextCursor: Number(offset) + Number(limit),
        hasMore: totalCount > Number(offset) + Number(limit),
      });
    } catch (error) {
      console.error("getCommunityItems error:", error);
      res.status(500).json({
        status: 500,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  // v2: 카테고리 기반으로 커뮤니티 글 작성
  postCommunityItemWithImageUploader: async (req, res) => {
    const { title, content, category } = req.body;
    const isAnonymous = req.body.isAnonymous === "true";
    const userId = req.userId;
    let uploadedImageUrls = [];

    try {
      if (req.files) {
        req.files.map(({ key }) => {
          uploadedImageUrls.push("https://static.kch-app.me/" + key);
        });
      }

      const communityData = await Communities.create({
        status: "normal",
        title: title,
        content: content,
        images: uploadedImageUrls,
        publisher: userId,
        isAnonymous: isAnonymous,
        category: category || "general", // 기본 카테고리 설정
      });

      // v2에서는 카테고리 기반 알림 (boardId 사용 안 함)
      if (category) {
        // 카테고리 관심 사용자들에게 알림 (추후 구현 예정)
        // await sendNotificationByCategory(
        //   category,
        //   `${category} 카테고리에 새로운 글이 올라왔어요!`,
        //   title,
        //   "kch://community-detail-screen/" + communityData._id,
        //   [userId]
        // );
      }

      res.json({
        status: 200,
        message: "정상적으로 업로드 되었습니다.",
        communityId: communityData._id,
      });
    } catch (error) {
      console.error("postCommunityItemWithImageUploader error:", error);
      res.status(500).json({
        status: 500,
        message: "업로드 중 오류가 발생했습니다.",
      });
    }
  },

  // v2: 커뮤니티 상세 조회 (기존과 동일하지만 에러 처리 강화)
  getCommunityDetail: async (req, res) => {
    const { id } = req.query;
    const userId = req.userId;

    try {
      const communityData = await Communities.findOne({
        _id: id,
        status: "normal",
      });

      if (!communityData) {
        return res
          .status(404)
          .json({ status: 404, message: "존재하지 않는 게시글 입니다." });
      }

      // 조회수 증가 (중복 방지)
      await Communities.updateOne(
        { _id: id },
        { $addToSet: { views: userId } },
      );

      const comments = await CommunityComment.find({
        communityId: id,
        $or: [{ status: "normal" }, { status: "hide" }],
      }).sort({ createdAt: 1 });

      res.json({
        ...communityData.toObject(),
        comments,
      });
    } catch (error) {
      console.error("getCommunityDetail error:", error);
      res.status(500).json({
        status: 500,
        message: "게시글 조회 중 오류가 발생했습니다.",
      });
    }
  },

  // v2: 사용 가능한 카테고리 목록 조회
  getCategories: async (req, res) => {
    try {
      // 하드코딩된 카테고리 목록 (추후 DB로 관리 가능)
      const categories = [
        { id: "top", name: "인기", color: "#D81B60" },
        { id: "general", name: "일반", color: "#dbeafe" },
        { id: "notice", name: "공지", color: "#fef3c6" },
        { id: "student", name: "학생회", color: "#f1f5f9" },
        { id: "club", name: "동아리", color: "#f1f5f9" },
        { id: "used", name: "중고거래", color: "#f1f5f9" },
        { id: "question", name: "설문", color: "#f1f5f9" },
      ];

      res.json({
        status: 200,
        message: "정상 처리되었습니다.",
        categories: categories,
      });
    } catch (error) {
      console.error("getCategories error:", error);
      res.status(500).json({
        status: 500,
        message: "카테고리 조회 중 오류가 발생했습니다.",
      });
    }
  },

  // v2: 사용자가 작성한 커뮤니티 글 조회 (카테고리별 필터링 가능)
  getCommunitiesWrittenByUser: async (req, res) => {
    const userId = req.userId;
    const { category } = req.query;

    try {
      let queryConditions = {
        publisher: userId,
        status: "normal",
      };

      if (category) {
        queryConditions.category = category;
      }

      const data = await Communities.find(queryConditions).sort({
        createdAt: -1,
      });

      res.json({
        status: 200,
        message: "정상 처리되었습니다.",
        communities: data,
      });
    } catch (error) {
      console.error("getCommunitiesWrittenByUser error:", error);
      res.status(500).json({
        status: 500,
        message: "게시글 조회 중 오류가 발생했습니다.",
      });
    }
  },

  // 기존 댓글, 좋아요, 신고 등의 기능은 v1과 동일하므로 재사용
  postComment: require("./community.controller").postComment,
  deleteComment: require("./community.controller").deleteComment,
  addLike: require("./community.controller").addLike,
  deleteLike: require("./community.controller").deleteLike,
  deleteCommunity: require("./community.controller").deleteCommunity,
  getBlockedUsers: require("./community.controller").getBlockedUsers,
  postBlockUser: require("./community.controller").postBlockUser,
  postReportCommunityItem: require("./community.controller")
    .postReportCommunityItem,
  postReportComment: require("./community.controller").postReportComment,
};
