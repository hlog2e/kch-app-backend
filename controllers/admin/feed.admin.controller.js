const Feed = require("../../models/feed");

module.exports = {
  getFeedItems: async (req, res) => {
    const feeds = await Feed.find({}).sort({ createdAt: -1 });
    const totalCount = await Feed.count({});

    res.json({
      status: 200,
      message: "정상 처리 되었습니다.",
      feeds: feeds,
      totalCount: totalCount,
    });
  },
  postFeedWithImageUploader: async (req, res) => {
    const { publisher, content } = req.body;
    const uploadedImagesArray = req.files.map(
      ({ key }) => "https://static.kch-app.me/" + key
    );

    await Feed.create({
      publisher: publisher,
      desc: content,
      images: uploadedImagesArray,
    });

    res.json({ status: 200, message: "정상적으로 업로드 되었습니다." });
  },
};
