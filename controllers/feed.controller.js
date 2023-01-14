const Feed = require("../models/feed");

module.exports = {
  getFeedItems: async (req, res) => {
    const { offset, limit } = req.query;

    const feeds = await Feed.find({}).limit(limit).skip(offset);

    const totalCount = await Feed.count({});

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      feeds: feeds,
      totalCount: totalCount,
      nextCursor: Number(offset) + Number(limit),
    });
  },
};
