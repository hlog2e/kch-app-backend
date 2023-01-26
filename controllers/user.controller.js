const User = require("../models/user");
module.exports = {
  getUserInfo: async (req, res) => {
    const userId = req.userId;

    const userData = await User.findOne({ _id: userId });

    res.json(userData);
  },

  modifyUserInfo: async (req, res) => {
    const userId = req.userId;
    await User.updateOne(
      { _id: userId },
      { grade: req.body.grade, class: req.body.class, number: req.body.number }
    );

    res.json({ status: 200, message: "정보 수정을 완료했습니다." });
  },

  registerPhoto: async (req, res) => {
    const fileName = req.file.key;
    const userId = req.userId;

    await User.updateOne(
      { _id: userId },
      { photo: "https://static.kch-app.me/" + fileName },
      { upsert: true }
    );

    res.json({ status: 200, message: "정상적으로 업로드 되었습니다." });
  },

  registerBarCode: async (req, res) => {
    const { barcode } = req.body;
    const userId = req.userId;

    await User.updateOne(
      { _id: userId },
      { barcode: barcode },
      { upsert: true }
    );

    res.json({
      status: 200,
      message: "정상적으로 바코드가 등록되었습니다.",
      barcode: barcode,
    });
  },
};
