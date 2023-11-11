const SchoolPhoto = require("../models/schoolPhoto");

module.exports = {
  getPhotos: async (req, res) => {
    const { limit, skip } = req.query;
    const data = await SchoolPhoto.find()
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await SchoolPhoto.count();

    res.json({
      status: 200,
      message: "정상 처리되었습니다.",
      items: data,
      nextCursor: Number(skip) + Number(limit),
      totalCount: totalCount,
    });
  },
};
