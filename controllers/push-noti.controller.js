const PushToken = require("../models/pushToken");
const { sendNotification } = require("../utils/expo-notifications");

module.exports = {
  registerPushToken: async (req, res) => {
    const { token } = req.body;
    const userId = req.userId;

    await PushToken.updateOne(
      { _id: token },
      { user_id: userId },
      { upsert: true }
    );

    res.json({ status: 200, message: "푸시 알림 등록을 성공했습니다." });
  },

  unRegisterPushToken: async (req, res) => {
    const { token } = req.body;

    await PushToken.deleteOne({ _id: token });

    res.json({ status: 200, message: "푸시 알림 등록 해제를 성공했습니다." });
  },

  sendNotificationToEveryone: async (req, res) => {
    const { title, message, link, password } = req.body;

    if (password !== process.env.PUSH_NOTI_PASSWORD) {
      return res.status(403).json({ status: 403, message: "권한이 없습니다." });
    }

    const data = await PushToken.find();
    let receiverArray = [];

    for (_item of data) {
      receiverArray.push(_item._id);
    }

    try {
      const result = await sendNotification(receiverArray, title, message, {
        link: link,
      });
      res.json({
        status: 200,
        message: "정상적으로 푸시알림을 보냈습니다.",
        tickets: result,
        link: link,
      });
    } catch (_err) {
      return res
        .status(500)
        .json({ status: 500, message: "푸시알림 전송을 실패하였습니다." });
    }
  },
};
