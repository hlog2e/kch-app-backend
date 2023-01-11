const Communities = require("../models/community");
const uuid = require("uuid");
const moment = require("moment");

module.exports = {
  getCommunityItems: async (req, res) => {
    const { offset, limit } = req.query;

    const beforeSort = await Communities.find({}).limit(limit).skip(offset);

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
  getCommunityDetail: async (req, res) => {
    const { id } = req.query;
    const data = await Communities.findOne({ _id: id });

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
};
