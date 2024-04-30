const { Expo } = require("expo-server-sdk");
const User = require("../models/user");
const PushToken = require("../models/pushToken");

module.exports = {
  sendNotification: async (_receiverArray, _title, _message, _data) => {
    let expo = new Expo();

    const receiverArray = _receiverArray;
    let messages = [];

    for (_pushToken of receiverArray) {
      //올바른 푸쉬 토큰이 아니면 return
      if (!Expo.isExpoPushToken(_pushToken)) {
        console.error(`푸쉬토큰 ${_pushToken} 은 올바르지 않습니다.`);
        continue;
      }

      messages.push({
        to: _pushToken,
        sound: "default",
        title: _title,
        body: _message,
        data: _data,
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(
          `총 ${ticketChunk.length}건의 푸시알림 전송 결과`,
          ticketChunk
        );
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error("푸시알림 발송 오류", error);
      }
    }

    return tickets;
  },

  sendNotificationByCategory: async (
    _category,
    _title,
    _msg,
    _link,
    _filter
  ) => {
    const subscribedUsers = await User.find({ notifications: _category });

    let subscriberIDArray = [];
    subscribedUsers.map((_data) => {
      subscriberIDArray.push(_data.id);
    });

    //만약 자기 자신한테는 안보내야할 경우를 대비해서 _filter Array 를 파라미터로 받아와서 제외 시킨 후 알림 발송
    const filteredIDArray = subscriberIDArray.filter(
      (_item) => !_filter.includes(_item)
    );

    const pushTokens = await PushToken.find({ user_id: filteredIDArray });
    let flatPushTokensArray = [];

    pushTokens.map((_data) => {
      flatPushTokensArray.push(_data._id);
    });

    await module.exports.sendNotification(flatPushTokensArray, _title, _msg, {
      link: _link,
    });
  },
};
