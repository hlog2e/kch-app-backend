const axios = require("axios");
const moment = require("moment");
const { sendNotificationByCategory } = require("../utils/expo-notifications");

module.exports = async function getWeatherAndNotify() {
  const todayDateTime = moment();
  const { data } = await axios.get(
    "https://api.openweathermap.org/data/2.5/forecast",
    {
      params: {
        appid: process.env.OPEN_WEATHER_KEY,
        lat: "36.6277786",
        lon: "127.5118068",
        cnt: "10",
      },
    }
  );

  const filteredbyDateTime = data.list.filter(
    ({ dt }) => moment.unix(dt).diff(todayDateTime, "days") === 0
  );

  const isRainyObject = filteredbyDateTime.find(({ pop }) => pop >= 0.5);

  if (!isRainyObject) {
    return console.log("오늘은 비 소식이 없습니다.");
  }

  const rainyPercent = isRainyObject.pop * 100;

  console.log(rainyPercent);

  sendNotificationByCategory(
    "weather",
    "오늘의 날씨",
    `오늘은 비 소식이 있습니다. 나올 때 우산을 챙겨주세요!\n[강수확률 ${rainyPercent}%]`,
    "",
    []
  );
};
