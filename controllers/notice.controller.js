const Notice = require("../models/notice");
const PushToken = require("../models/pushToken");
const { sendNotification } = require("../utils/expo-notifications");

module.exports = {
  getNotices: async (req, res) => {
    const data = await Notice.find().sort({ _id: -1 });
    res.json(data);
  },
  sendNoticeAndPushNotificationToEveryone: async (req, res) => {
    const { title, content, writer } = req.body;

    await Notice.create({ title: title, content: content, writer: writer });

    //여기서 부터는 푸시 알림 전송 로직
    const data = await PushToken.find();
    let receiverArray = [];

    for (_item of data) {
      receiverArray.push(_item._id);
    }

    try {
      const result = await sendNotification(
        receiverArray,
        "공지사항",
        content,
        { link: "kch://notice" }
      );
      res.json({
        status: 200,
        message: "정상적으로 공지알림을 보냈습니다.",
        tickets: result,
      });
    } catch (_err) {
      return res
        .status(500)
        .json({ status: 500, message: "푸시알림 전송을 실패하였습니다." });
    }
  },
};
