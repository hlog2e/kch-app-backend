const Communities = require("../models/community");
const mongoose = require("mongoose");
const ObjectID = mongoose.Types.ObjectId();
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
    const communityId = req.body.communityId;
    const comment = req.body.comment;
    const userId = req.userId;

    console.log(userId, communityId);

    const data = await Communities.update(
      { _id: communityId },
      {
        $push: {
          comments: {
            _id: ObjectID,
            issuer: userId,
            comment: comment,
            createdAt: moment(),
          },
        },
      }
    );

    console.log(data);

    res.json({
      status: 200,
      message: "정상 처리되었습니다.",
      comment: comment,
    });
  },
};
