const Feed = require("../models/feed");
const { sendNotificationByCategory } = require("../utils/expo-notifications");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
  getFeedItems: async (req, res) => {
    const { offset, limit } = req.query;

    const feeds = await Feed.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: Number(offset) },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "users",
          localField: "publisher",
          foreignField: "_id",
          as: "publisherData",
        },
      },
      { $unwind: "$publisherData" },
      {
        $project: {
          _id: 1,
          publisher: 1,
          content: 1,
          images: 1,
          createdAt: 1,
          publisherPhoto: "$publisherData.profilePhoto",
          publisherName: "$publisherData.name",
          publisherDesc: "$publisherData.desc",
        },
      },
    ]);

    const totalCount = await Feed.count({});

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      feeds: feeds,
      totalCount: totalCount,
      nextCursor: Number(offset) + Number(limit),
    });
  },

  postFeedWithImageUploader: async (req, res) => {
    const { content } = req.body;
    const userId = req.userId;
    let uploadedImageUrls = [];

    if (req.files) {
      req.files.map(({ key }) => {
        uploadedImageUrls.push("https://static.kch-app.me/" + key);
      });
    }

    await Feed.create({
      publisher: ObjectId(userId),
      content: content,
      images: uploadedImageUrls,
    });

    await sendNotificationByCategory(
      "feed",
      "피드에 새로운 글이 올라왔어요!",
      content + "\n\n※ 알림 끄기는 더보기 > 알림설정",
      "kch://feed",
      [userId]
    );

    res.json({
      status: 200,
      message: "정상적으로 업로드 되었습니다.",
    });
  },

  deleteFeed: async (req, res) => {
    const { feedId } = req.body;
    const userId = req.userId;

    const exists = await Feed.findOne({
      _id: feedId,
      publisher: ObjectId(userId),
    }).count();

    if (!exists) {
      return res.status(400).json({
        status: 400,
        message: "존재하지 않는 피드 이거나, 삭제 권한이 없습니다. (삭제 실패)",
      });
    }

    await Feed.deleteOne({ _id: feedId });

    res.json({ status: 200, message: "정상적으로 삭제되었습니다." });
  },
};
