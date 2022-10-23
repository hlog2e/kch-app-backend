const axios = require("axios");

const moment = require("moment");
const Meal = require("../models/meal");

module.exports = async function getMeals() {
  const todayDate = moment("202209").format("YYYYMM");

  const startDate = moment(todayDate).add("1", "M").format("YYYYMMDD");
  const endDate = moment(startDate).endOf("M").format("YYYYMMDD");

  console.log(startDate);
  console.log(endDate);

  const { data } = await axios.get(
    "https://open.neis.go.kr/hub/mealServiceDietInfo",
    {
      params: {
        key: "d531f1be822747d78988989a2a35d259",
        type: "json",
        ATPT_OFCDC_SC_CODE: "M10",
        SD_SCHUL_CODE: "8000038",
        MLSV_FROM_YMD: startDate,
        MLSV_TO_YMD: endDate,
      },
    }
  );

  const mealData = data.mealServiceDietInfo[1].row;

  let organizedData = [];
  mealData.map((_item) => {
    const unOrganizedMenu = _item.DDISH_NM;
    const menyArray = unOrganizedMenu.split("<br/>"); // <br/>태그 기반으로 배열로 변환

    //알레르기 정보 제거 = pureMenuArray
    const pureMenuArray = menyArray.map((_item) => {
      const spaceIndex = _item.indexOf(" ");
      return _item.substr(0, spaceIndex);
    });

    organizedData.push({
      _id: _item.MLSV_YMD + "-" + _item.MMEAL_SC_CODE,
      date: _item.MLSV_YMD,
      type: _item.MMEAL_SC_NM,
      menu: pureMenuArray,
      kcal: _item.CAL_INFO,
    });
  });

  for (_item of organizedData) {
    console.log(_item._id);
    await Meal.updateMany(
      { _id: _item.date },
      {
        $addToSet: {
          meals: {
            _id: _item._id,
            type: _item.type,
            menu: _item.menu,
            kcal: _item.kcal,
          },
        },
      },
      { upsert: true }
    );
  }
};
