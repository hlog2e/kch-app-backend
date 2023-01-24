const PushToken = require("../models/pushToken");

module.exports = {
  registerPushToken: async (req, res) => {
    const { token } = req.body;
    const userId = req.userId;
    console.log(token, userId);

    await PushToken.updateOne(
      { _id: token },
      { user_id: userId },
      { upsert: true }
    );

    res.json({ status: 200, message: "푸시 알림 등록을 성공했습니다." });
  },
};
