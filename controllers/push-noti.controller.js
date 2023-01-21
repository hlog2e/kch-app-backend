const PushToken = require("../models/pushToken");
const { sendNotification } = require("../utils/expo-notifications");

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
  sendNotificationToEveryone: async (req, res) => {
    const { title, message, link } = req.body;

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
      });
    } catch (_err) {
      return res
        .status(500)
        .json({ status: 500, message: "푸시알림 전송을 실패하였습니다." });
    }
  },
};
