const Meal = require("../models/meal");
const moment = require("moment");
const { sendNotificationByCategory } = require("../utils/expo-notifications");

module.exports = async function notifyMealLaunch() {
  const todayDate = moment().format("YYYYMMDD");
  const mealData = await Meal.findOne({ _id: todayDate });

  if (!mealData) {
    return console.log("스케쥴러 알림: 오늘은 중식이 없습니다.");
  }
  const filteredLaunchData = mealData.meals.filter(({ type }) => {
    return type === "중식";
  });

  if (filteredLaunchData.length === 0) {
    return console.log("스케쥴러 알림: 오늘은 중식이 없습니다.");
  }

  const launch = filteredLaunchData[0].menu.join(", ");

  console.log(launch);

  await sendNotificationByCategory(
    "meal",
    "오늘의 중식",
    launch,
    "kch://meal",
    []
  );
};
