const Communities = require("../models/community");
const User = require("../models/user");
const PushToken = require("../models/pushToken");
const uuid = require("uuid");
const moment = require("moment");
const {
  sendNotification,
  sendNotificationByCategory,
} = require("../utils/expo-notifications");

module.exports = {
  getCommunityItems: async (req, res) => {
    const { offset, limit } = req.query;

    const userId = req.userId;

    //차단한 유저 리스트 쿼리
    const { blockedUsers } = await User.findOne({ _id: userId });

    const data = await Communities.find({
      status: "normal",
      publisher: { $nin: blockedUsers }, //차단한 유저의 게시물은 제외 후 쿼리
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
    const { title, content } = req.body;
    const userId = req.userId;
    let uploadedImageUrls = [];

    if (req.files) {
      req.files.map(({ key }) => {
        uploadedImageUrls.push("https://static.kch-app.me/" + key);
      });
    }

    await Communities.create({
      title: title,
      content: content,
      images: uploadedImageUrls,
      publisher: userId,
      status: "normal",
    });

    await sendNotificationByCategory(
      "community",
      "커뮤니티에 새로운 글이 올라왔어요!",
      title + "\n\n※ 알림 끄기는 더보기 > 알림설정",
      "kch://community",
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
    const data = await Communities.findOne({ _id: id, status: "normal" });

    if (!data) {
      return res
        .status(404)
        .json({ status: 404, message: "존재하지 않는 게시글 입니다." });
    }

    await Communities.updateOne({ _id: id }, { $addToSet: { views: userId } });
    res.json(data);
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
    const { communityId, comment } = req.body;
    const userId = req.userId;

    await Communities.update(
      { _id: communityId },
      {
        $push: {
          comments: {
            _id: uuid.v4(),
            issuer: userId,
            comment: comment,
            createdAt: moment(),
          },
        },
        $inc: { commentCount: 1 },
      }
    );

    // 해당부분 부터는 글 작성자에게 다른 사람이 댓글 남겼을 때 알림 전송하는 로직 --------------
    const { publisher, title } = await Communities.findOne({
      _id: communityId,
    });

    const pushTokens = await PushToken.find({ user_id: publisher });
    let receiverArray = [];

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
      comment: comment,
    });
  },

  deleteComment: async (req, res) => {
    const { communityId, commentId } = req.body;
    const userId = req.userId;

    const { comments } = await Communities.findOne(
      {
        _id: communityId,
        "comments._id": commentId,
      },
      "comments.$"
    );

    const commentIssuer = comments[0].issuer;

    if (commentIssuer === userId) {
      await Communities.updateOne(
        { _id: communityId },
        { $pull: { comments: { _id: commentId } }, $inc: { commentCount: -1 } }
      );
      return res.json({ status: 200, message: "정상 처리되었습니다." });
    }

    const user = await User.findOne({ _id: userId }, ["isAdmin"]);

    if (user.isAdmin) {
      await Communities.updateOne(
        { _id: communityId },
        { $pull: { comments: { _id: commentId } }, $inc: { commentCount: -1 } }
      );
      return res.json({ status: 200, message: "정상 처리되었습니다." });
    }

    res.json({ status: 401, message: "권한이 없습니다." });
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

    res.json({ status: 200, message: "정상적으로 신고처리 되었습니다." });
  },

  postReportComment: async (req, res) => {
    const userId = req.userId;
    const { postId, commentId } = req.body;

    const test = await Communities.updateOne(
      {
        _id: postId,
        "comments._id": commentId,
      },
      { $addToSet: { "comments.$.reports": userId } }
    );

    console.log(test);

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
