const Communities = require("../models/community");
const User = require("../models/user");
const Report = require("../models/report");
const uuid = require("uuid");
const moment = require("moment");

module.exports = {
  getCommunityItems: async (req, res) => {
    const { offset, limit } = req.query;
    const userId = req.userId;

    //차단한 유저 리스트 쿼리
    const { blocked_users } = await User.findOne({ _id: userId });

    const beforeSort = await Communities.find({
      status: "normal",
      publisher: { $nin: blocked_users }, //차단한 유저의 게시물은 제외 후 쿼리
    })
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 });

    const totalCount = await Communities.count({});

    const afterSort = beforeSort.map((_item) => {
      return {
        _id: _item._id,
        title: _item.title,
        content: _item.content,
        likes: _item.likes,
        likeCount: _item.likes.length,
        comments: _item.comments,
        commentCount: _item.comments.length,
        images: _item.images,
        publisher: _item.publisher,
        createdAt: _item.createdAt,
      };
    });

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      communities: afterSort,
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

    const data = await Communities.create({
      title: title,
      content: content,
      images: uploadedImageUrls,
      publisher: userId,
      status: "normal",
    });

    console.log(data);

    res.json({
      status: 200,
      message: "정상적으로 업로드 되었습니다.",
    });
  },
  getCommunityDetail: async (req, res) => {
    const { id } = req.query;
    const data = await Communities.findOne({ _id: id, status: "normal" });

    if (!data) {
      return res
        .status(404)
        .json({ status: 404, message: "존재하지 않는 게시글 입니다." });
    }
    res.json({
      _id: data._id,
      title: data.title,
      content: data.content,
      likes: data.likes,
      likeCount: data.likes.length,
      comments: data.comments,
      commentCount: data.comments.length,
      images: data.images,
      publisher: data.publisher,
      createdAt: data.createdAt,
    });
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
      }
    );

    res.json({
      status: 200,
      message: "정상 처리되었습니다.",
      comment: comment,
    });
  },

  deleteComment: async (req, res) => {
    const { communityId, commentId } = req.body;
    const userId = req.userId;

    //TODO: 댓글 삭제전 자기가 쓴 댓글인지 판별해주는 로직 추가 필요
    const result = await Communities.update(
      { _id: communityId },
      { $pull: { comments: { _id: commentId } } }
    );

    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  addLike: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    await Communities.update(
      { _id: communityId },
      { $push: { likes: userId } }
    );

    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  deleteLike: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    await Communities.update(
      { _id: communityId },
      { $pull: { likes: userId } }
    );

    res.json({ status: 200, message: "정상 처리되었습니다." });
  },

  deleteCommunity: async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    const community = await Communities.findOne({ _id: communityId });

    if (community.publisher === userId) {
      await Communities.update({ _id: communityId }, { status: "deleted" });
      return res.json({ status: 200, message: "정상 처리되었습니다." });
    }
    res.status(403).json({ status: 403, message: "권한이 없습니다." });
  },

  getBlockedUsers: async (req, res) => {
    const userId = req.userId;

    const { blocked_users } = await User.findOne({ _id: userId });

    res.json(blocked_users);
  },

  postBlockUser: async (req, res) => {
    const userId = req.userId;
    const { blockUserId } = req.body;

    await User.updateOne(
      { _id: userId },
      { $addToSet: { blocked_users: blockUserId } }
    );

    res.json({ status: 200, message: `유저 ${blockUserId}를 차단하였습니다.` });
  },

  postReportCommunityItem: async (req, res) => {
    const userId = req.userId;
    const { postId } = req.body;

    await Report.create({
      type: "post",
      post_id: postId,
      issuer: userId,
      status: "open",
    });

    res.json({ status: 200, message: "정상적으로 신고처리 되었습니다." });
  },

  postReportComment: async (req, res) => {
    const userId = req.userId;
    const { postId, commentId } = req.body;

    await Report.create({
      type: "comment",
      post_id: postId,
      comment_id: commentId,
      issuer: userId,
      status: "open",
    });

    res.json({
      status: 200,
      message: "정상적으로 해당 댓글이 신고처리 되었습니다.",
    });
  },
};
