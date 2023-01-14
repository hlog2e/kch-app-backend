const Communities = require("../models/community");
const uuid = require("uuid");
const moment = require("moment");

module.exports = {
  getCommunityItems: async (req, res) => {
    const { offset, limit } = req.query;

    const beforeSort = await Communities.find({ status: "normal" })
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
};
