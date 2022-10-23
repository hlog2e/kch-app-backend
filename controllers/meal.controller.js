const Meal = require("../models/meal");

module.exports = {
  getMealbyDate: async (req, res) => {
    const { date, limit } = req.query;

    console.log(date);
    const queryData = await Meal.find({ _id: { $gte: date } })
      .sort({ _id: 1 })
      .limit(limit);

    res
      .status(200)
      .json({ status: 200, message: "정상 처리되었습니다.", data: queryData });
  },
};
