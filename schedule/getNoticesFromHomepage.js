const Notice = require("../models/notice");
const cheerio = require("cheerio");
const axios = require("axios");
const moment = require("moment");

module.exports = async function getNoticesFromHomepage() {
  let pageNum = 1;
  let existCount = 0;

  while (true) {
    if (existCount > 3) {
      console.log("학교 홈페이지 공지사항 크롤링 완료.");
      break;
    }

    const pageData = await getItemsFromBoard(pageNum);

    if (pageData) {
      const exists = await Notice.find({ _id: pageData.id }).count();

      if (exists >= 10) {
        console.log(
          "공지데이터 크롤링 : " +
            pageNum +
            " 이미 저장된 페이지입니다. 다음 페이지로 이동."
        );
        pageNum = pageNum + 1;
        existCount++;
        continue;
      }

      pageData.id.map(async (id, index) => {
        await getHtmlAndSaveToDB(
          id,
          pageData.title[index],
          pageData.url[index],
          pageData.teacher[index],
          pageData.createdAt[index]
        );
        console.log(
          "공지데이터 크롤링 : " +
            pageNum +
            "페이지 " +
            index +
            "번째 공지 데이터 수집."
        );
      });
      pageNum = pageNum + 1;
    } else {
      break;
    }
  }

  async function getItemsFromBoard(_pageNum) {
    const { data } = await axios.get(
      "https://school.cbe.go.kr/kch-h/M010601/list",
      {
        params: { s_idx: _pageNum },
      }
    );

    const $ = cheerio.load(data);
    const noticeArray = $(".usm-brd-lst tbody tr").not(".tch-ann");

    let idArray = [];
    let titleArray = [];
    let urlArray = [];
    let teacherArray = [];
    let createdAtArray = [];

    noticeArray.map((i, e) => {
      const $item = cheerio.load(e);

      idArray.push($item(".tch-num").text().trim());
      titleArray.push($item(".tch-tit").text().trim());
      urlArray.push("https://school.cbe.go.kr" + $item("a")[0].attribs.href);
      teacherArray.push($item(".tch-nme").text().trim());
      createdAtArray.push(moment($item(".tch-dte").text().trim(), "YY.MM.DD"));
    });

    return {
      id: idArray,
      title: titleArray,
      url: urlArray,
      teacher: teacherArray,
      createdAt: createdAtArray,
    };
  }

  async function getHtmlAndSaveToDB(_id, _title, _url, _teacher, _createdAt) {
    const { data } = await axios.get(_url);

    const $ = cheerio.load(data);
    const contentHtml = $(".tch-ctnt").html().trim();

    await Notice.updateOne(
      { _id: _id },
      {
        title: _title,
        url: _url,
        teacher: _teacher,
        html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${contentHtml}</body></html>`,
        createdAt: _createdAt,
      },
      { upsert: true }
    );
  }
};
