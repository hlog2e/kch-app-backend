const User = require("../models/user");
module.exports = {
  getUserInfo: async (req, res) => {
    const userId = req.userId;

    const userData = await User.findOne({ _id: userId });

    res.json(userData);
  },

  editUserInfo: async (req, res) => {
    const userId = req.userId;
    const { name, desc } = req.body;
    await User.updateOne({ _id: userId }, { name: name, desc: desc });

    res.json({ status: 200, message: "정보 수정을 완료했습니다." });
  },

  registerProfilePhoto: async (req, res) => {
    const fileName = req.file.key;
    const userId = req.userId;

    await User.updateOne(
      { _id: userId },
      { profilePhoto: "https://static.kch-app.me/" + fileName }
    );

    res.json({ status: 200, message: "정상적으로 업로드 되었습니다." });
  },

  deleteProfilePhoto: async (req, res) => {
    const userId = req.userId;
    await User.updateOne({ _id: userId }, { $unset: { profilePhoto: 1 } });

    res.json({ status: 200, message: "정상적으로 삭제되었습니다." });
  },

  registerIdPhoto: async (req, res) => {
    const fileName = req.file.key;
    const userId = req.userId;

    await User.updateOne(
      { _id: userId },
      { idPhoto: "https://static.kch-app.me/" + fileName }
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

  getCurrentNotificationSetting: async (req, res) => {
    const userId = req.userId;
    const { notifications } = await User.findOne({ _id: userId });
    res.json(notifications);
  },
  postUpdateNotificationSetting: async (req, res) => {
    const { category, isRegister } = req.body;
    const userId = req.userId;

    //들어오는 요청이 카테고리를 등록하는 요청이면
    if (isRegister) {
      await User.update(
        { _id: userId },
        { $addToSet: { notifications: category } }
      );

      return res.json({
        status: 200,
        message: `$알림 {category}를 수신합니다.`,
      });
    } else {
      await User.update(
        { _id: userId },
        { $pull: { notifications: category } }
      );

      return res.json({
        status: 200,
        message: `$알림 {category}를 수신하지 않습니다.`,
      });
    }
  },
  resetBlockUserList: async (req, res) => {
    const userId = req.userId;

    await User.updateOne({ _id: userId }, { $set: { blockedUsers: [] } });

    res.json({ status: 200, message: "정상적으로 초기화 되었습니다." });
  },

  getMyTimetable: async (req, res) => {
    const userId = req.userId;

    const data = await User.findOne({ _id: userId }, "-_id timetable");

    if (!data.timetable) {
      return res.json(null);
    }

    res.json(data.timetable);
  },

  postMyTimetable: async (req, res) => {
    const { timetable } = req.body;
    const userId = req.userId;

    await User.updateOne({ _id: userId }, { timetable: timetable });

    res.json({ status: 200, message: "정상 업데이트 되었습니다." });
  },
};
