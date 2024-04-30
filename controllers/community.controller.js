const Communities = require("../models/community");
const CommunityBoard = require("../models/communityBoard");
const CommunityComment = require("../models/communityComment");
const User = require("../models/user");
const PushToken = require("../models/pushToken");

const {
  sendNotification,
  sendNotificationByCategory,
} = require("../utils/expo-notifications");

module.exports = {
  getCommunityBoards: async (req, res) => {
    const boards = await CommunityBoard.find().sort({ _id: 1 });

    res.json(boards);
  },
  getCommunityBoardFixed: async (req, res) => {
    const userId = req.userId;
    const userData = await User.findOne({ _id: userId });

    res.json(userData.communityBoardFixed);
  },
  postCommunityBoardFix: async (req, res) => {
    const userId = req.userId;
    const { boardId } = req.body;

    await User.updateOne(
      { _id: userId },
      { $push: { communityBoardFixed: boardId } }
    );
    res.json({ status: 200, message: "정상 처리되었습니다." });
  },
  postCommunityBoardUnFix: async (req, res) => {
    const userId = req.userId;
    const { boardId } = req.body;

    await User.updateOne(
      { _id: userId },
      { $pull: { communityBoardFixed: boardId } }
    );
    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  getCommunityItems: async (req, res) => {
    const { offset, limit, boardId } = req.query;
    const userId = req.userId;

    //임시로 커뮤니티 기능이 업데이트 되었을 때 재시작을 유도하는 메시지를 보내는 로직
    //TODO: 추후 삭제
    if (!boardId) {
      return res.json({
        communities: [
          {
            _id: "temp",
            title: "앱을 재시작 해주세요!",
            content:
              "커뮤니티 기능이 새롭게 업데이트되었습니다! 원활한 작동을 위해 앱을 1~2회 껐다 켜주시기 바랍니다.",
            images: [],
          },
        ],
      });
    }
    //임시로 커뮤니티 기능이 업데이트 되었을 때 재시작을 유도하는 메시지를 보내는 로직

    const { blockedUsers, type } = await User.findOne({ _id: userId });
    const { role } = await CommunityBoard.findOne({
      _id: boardId,
    });

    if (!role.includes(type)) {
      return res
        .status(403)
        .json({ status: 403, message: "해당 게시판 접근 권한이 없습니다." });
    }

    const data = await Communities.find({
      status: "normal",
      publisher: { $nin: blockedUsers }, //차단한 유저의 게시물은 제외 후 쿼리
      boardId: boardId,
    })
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const totalCount = await Communities.count({});

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      communities: data,
      totalCount: totalCount,
      nextCursor: Number(offset) + Number(limit),
    });
  },
  postCommunityItemWithImageUploader: async (req, res) => {
    const { title, content, boardId } = req.body;
    const isAnonymous = req.body.isAnonymous === "true";
    const userId = req.userId;
    let uploadedImageUrls = [];

    if (req.files) {
      req.files.map(({ key }) => {
        uploadedImageUrls.push("https://static.kch-app.me/" + key);
      });
    }
    const userData = await User.findOne({ _id: userId });

    const communityData = await Communities.create({
      status: "normal",
      title: title,
      content: content,
      images: uploadedImageUrls,
      publisher: userId,
      publisherName: isAnonymous ? null : userData.name,
      publisherDesc: isAnonymous ? null : userData.desc,
      isAnonymous: isAnonymous,
      boardId: boardId,
    });

    const boardData = await CommunityBoard.findOne({
      _id: boardId,
    });

    await sendNotificationByCategory(
      boardId,
      `${boardData.name} 게시판에 새로운 글이 올라왔어요!`,
      title,
      "kch://community-detail-screen/" + communityData._id,
      [userId]
    );

    res.json({
      status: 200,
      message: "정상적으로 업로드 되었습니다.",
    });
  },
  getCommunityDetail: async (req, res) => {
    const { id } = req.query;
    const userId = req.userId;
    const communityData = await Communities.findOne({
      _id: id,
      status: "normal",
    });

    if (!communityData) {
      return res
        .status(404)
        .json({ status: 404, message: "존재하지 않는 게시글 입니다." });
    }

    await Communities.updateOne({ _id: id }, { $addToSet: { views: userId } });

    const comments = await CommunityComment.find({
      communityId: id,
      $or: [{ status: "normal" }, { status: "hide" }],
    });

    res.json({
      ...communityData.toObject(),
      comments,
    });
  },
  getCommunitiesWrittenByUser: async (req, res) => {
    const userId = req.userId;

    const data = await Communities.find({
      publisher: userId,
      status: "normal",
    }).sort({ createdAt: -1 });

    res.json(data);
  },
  postComment: async (req, res) => {
    const { communityId, comment, isAnonymous } = req.body;

    const userId = req.userId;
    const userData = await User.findOne({ _id: userId });

    await CommunityComment.create({
      status: "normal",
      communityId: communityId,
      issuer: userId,
      issuerName: isAnonymous ? null : userData.name,
      issuerDesc: isAnonymous ? null : userData.desc,
      comment: comment,
      isAnonymous: isAnonymous,
      reports: [],
    });

    await Communities.update(
      { _id: communityId },
      { $inc: { commentCount: 1 } }
    ); // 댓글 수 increase

    // 해당부분 부터는 글 작성자에게 다른 사람이 댓글 남겼을 때 알림 전송하는 로직 --------------
    const { publisher, title } = await Communities.findOne({
      _id: communityId,
    });
    const pushTokens = await PushToken.find({ user_id: publisher });
    let receiverArray = [];
    // TODO: 여기부분 noti 전송시 큐로 처리되도록 변경해야함.
    pushTokens.map(({ _id }) => {
      receiverArray.push(_id);
    });
    //댓글 작성자가 커뮤니티 글의 작성자 본인이 아닐 시 알림 전송
    if (userId !== publisher) {
      sendNotification(
        receiverArray,
        `내 게시물 "${title}"에 댓글이 달렸어요!`,
        comment,
        { link: "kch://community-detail-screen/" + communityId }
      );
    }
    //----------------------------------------------------------------------
    res.json({
      status: 200,
      message: "정상 처리되었습니다.",
    });
  },

  deleteComment: async (req, res) => {
    const { communityId, commentId } = req.body;
    const userId = req.userId;

    await CommunityComment.updateOne(
      { _id: commentId, issuer: userId },
      { status: "deleted" }
    );

    await Communities.updateOne(
      { _id: communityId },
      { $inc: { commentCount: -1 } }
    );
    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  addLike: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    await Communities.update(
      { _id: communityId },
      { $push: { likes: userId }, $inc: { likeCount: 1 } }
    );

    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  deleteLike: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    await Communities.update(
      { _id: communityId },
      { $pull: { likes: userId }, $inc: { likeCount: -1 } }
    );

    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  deleteCommunity: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    const community = await Communities.findOne({ _id: communityId });

    if (community.publisher === userId) {
      await Communities.updateOne({ _id: communityId }, { status: "deleted" });
      return res.json({ status: 200, message: "정상 처리되었습니다." });
    }

    const user = await User.findOne({ _id: userId }, ["isAdmin"]);
    if (user.isAdmin) {
      await Communities.updateOne(
        { _id: communityId },
        { status: "deletedByAdmin" }
      );
      return res.json({ status: 200, message: "정상 처리되었습니다." });
    }
    res.status(403).json({ status: 403, message: "권한이 없습니다." });
  },

  getBlockedUsers: async (req, res) => {
    const userId = req.userId;
    const { blockedUsers } = await User.findOne({ _id: userId });

    res.json(blockedUsers);
  },

  postBlockUser: async (req, res) => {
    const userId = req.userId;
    const { blockUserId } = req.body;

    await User.updateOne(
      { _id: userId },
      { $addToSet: { blockedUsers: blockUserId } }
    );

    res.json({ status: 200, message: `유저 ${blockUserId}를 차단하였습니다.` });
  },

  postReportCommunityItem: async (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;

    await Communities.updateOne(
      { _id: postId },
      { $addToSet: { reports: userId } }
    );

    //TODO: 여기에 관리자에게 noti 하는 로직 추가

    res.json({ status: 200, message: "정상적으로 신고처리 되었습니다." });
  },

  postReportComment: async (req, res) => {
    const userId = req.userId;
    const { commentId } = req.body;

    await CommunityComment.updateOne(
      {
        _id: commentId,
      },
      { $addToSet: { reports: userId } }
    );

    //TODO: 여기에 관리자에게 noti 하는 로직 추가

    res.json({
      status: 200,
      message: "정상적으로 해당 댓글이 신고처리 되었습니다.",
    });
  },

  checkBadWord: async (req, res) => {
    const { text } = req.body;

    const result = await checkBadWordByGPT(text);

    res.send(result);
  },
};
