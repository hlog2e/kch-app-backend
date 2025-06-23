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
    const { offset, limit } = req.query;
    const userId = req.userId;

    const { blockedUsers, type } = await User.findOne({ _id: userId });
    // const { role } = await CommunityBoard.findOne({
    //   _id: boardId,
    // });

    // if (!role.includes(type)) {
    //   return res
    //     .status(403)
    //     .json({ status: 403, message: "해당 게시판 접근 권한이 없습니다." });
    // }

    const data = await Communities.find({
      status: "normal",
      publisher: { $nin: blockedUsers }, //차단한 유저의 게시물은 제외 후 쿼리
    })
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    // v1 호환성을 위해 publisher 객체를 평면화
    const communitiesWithFlattenedPublisher = data.map((community) => {
      const communityObj = community.toObject();

      // publisher 객체에서 name, desc 추출
      if (
        communityObj.publisher &&
        typeof communityObj.publisher === "object"
      ) {
        communityObj.publisherName = communityObj.isAnonymous
          ? null
          : communityObj.publisher.name;
        communityObj.publisherDesc = communityObj.isAnonymous
          ? null
          : communityObj.publisher.desc;
        // v1에서는 publisher ObjectId만 유지
        communityObj.publisher = communityObj.publisher._id;
      }

      return communityObj;
    });

    const totalCount = await Communities.count({});

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      communities: communitiesWithFlattenedPublisher,
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

    // v1 호환성을 위해 댓글의 issuer 객체도 평면화
    const commentsWithFlattenedIssuer = comments.map((comment) => {
      const commentObj = comment.toObject();

      if (commentObj.issuer && typeof commentObj.issuer === "object") {
        commentObj.issuerName = commentObj.isAnonymous
          ? null
          : commentObj.issuer.name;
        commentObj.issuerDesc = commentObj.isAnonymous
          ? null
          : commentObj.issuer.desc;
        commentObj.issuer = commentObj.issuer._id;
      }

      return commentObj;
    });

    // v1 호환성을 위해 publisher 객체를 평면화
    const communityObj = communityData.toObject();
    if (communityObj.publisher && typeof communityObj.publisher === "object") {
      communityObj.publisherName = communityObj.isAnonymous
        ? null
        : communityObj.publisher.name;
      communityObj.publisherDesc = communityObj.isAnonymous
        ? null
        : communityObj.publisher.desc;
      communityObj.publisher = communityObj.publisher._id;
    }

    res.json({
      ...communityObj,
      comments: commentsWithFlattenedIssuer,
    });
  },
  getCommunitiesWrittenByUser: async (req, res) => {
    const userId = req.userId;

    const data = await Communities.find({
      publisher: userId,
      status: "normal",
    }).sort({ createdAt: -1 });

    // v1 호환성을 위해 publisher 객체를 평면화
    const communitiesWithFlattenedPublisher = data.map((community) => {
      const communityObj = community.toObject();

      if (
        communityObj.publisher &&
        typeof communityObj.publisher === "object"
      ) {
        communityObj.publisherName = communityObj.isAnonymous
          ? null
          : communityObj.publisher.name;
        communityObj.publisherDesc = communityObj.isAnonymous
          ? null
          : communityObj.publisher.desc;
        communityObj.publisher = communityObj.publisher._id;
      }

      return communityObj;
    });

    res.json(communitiesWithFlattenedPublisher);
  },
  postComment: async (req, res) => {
    const { communityId, comment, isAnonymous } = req.body;

    const userId = req.userId;
    const userData = await User.findOne({ _id: userId });

    await CommunityComment.create({
      status: "normal",
      communityId: communityId,
      issuer: userId,
      comment: comment,
      isAnonymous: isAnonymous,
      reports: [],
    });

    await Communities.update(
      { _id: communityId },
      { $inc: { commentCount: 1 } }
    ); // 댓글 수 increase

    // 해당부분 부터는 글 작성자에게 다른 사람이 댓글 남겼을 때 알림 전송하는 로직 --------------
    const communityForNotification = await Communities.findOne({
      _id: communityId,
    });

    // publisher가 객체인 경우 _id만 추출
    const publisherId =
      communityForNotification.publisher._id ||
      communityForNotification.publisher;
    const { title } = communityForNotification;
    const pushTokens = await PushToken.find({ user_id: publisherId });
    let receiverArray = [];
    // TODO: 여기부분 noti 전송시 큐로 처리되도록 변경해야함.
    pushTokens.map(({ _id }) => {
      receiverArray.push(_id);
    });
    //댓글 작성자가 커뮤니티 글의 작성자 본인이 아닐 시 알림 전송
    if (!userId.equals(publisherId)) {
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

    // publisher가 객체인 경우 _id 추출
    const publisherId = community.publisher._id || community.publisher;

    if (publisherId.equals(userId)) {
      await Communities.updateOne({ _id: communityId }, { status: "deleted" });
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
