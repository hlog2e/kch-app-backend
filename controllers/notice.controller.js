const Notice = require("../models/notice");

module.exports = {
  getNotices: async (req, res) => {
    const { limit, skip } = req.query;
    const data = await Notice.find({}, "_id title url teacher createdAt")
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Notice.count();

    res.json({
      status: 200,
      message: "정상 처리되었습니다.",
      notices: data,
      nextCursor: Number(skip) + Number(limit),
      totalCount: totalCount,
    });
  },

  getNoticeDetail: async (req, res) => {
    const { noticeId } = req.query;
    console.log(noticeId);
    const data = await Notice.findById(noticeId);

    res.json(data);
  },
};
