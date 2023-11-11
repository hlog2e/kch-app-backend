const cheerio = require("cheerio");
const axios = require("axios");
const moment = require("moment");
const SchoolPhoto = require("../models/schoolPhoto");

module.exports = async function getPhotosFromHomepage() {
  let pageNum = 1;
  let existCount = 0;
  while (true) {
    if (existCount > 3) {
      console.log("학교 홈페이지 활동사진 크롤링 완료.");
      break;
    }
    const pageData = await getItemsFromBoard(pageNum);

    if (pageData) {
      const exists = await SchoolPhoto.find({ _id: pageData.id }).count();

      if (exists === 12) {
        console.log(
          "사진데이터 크롤링 : " +
            pageNum +
            " 이미 저장된 페이지입니다. 다음 페이지로 이동."
        );
        pageNum = pageNum + 1;
        existCount++;
        continue;
      }
      pageData.id.map(async (id, index) => {
        await getPhotosAndSaveToDB(
          id,
          pageData.url[index],
          pageData.title[index],
          pageData.teacher[index],
          pageData.createdAt[index]
        );
        console.log(
          "사진데이터 크롤링" +
            pageNum +
            "페이지 " +
            index +
            "번째 사진 데이터 수집."
        );
      });
      pageNum = pageNum + 1;
    } else {
      break;
    }
  }

  async function getItemsFromBoard(_id) {
    const { data } = await axios.get(
      "https://school.cbe.go.kr/kch-h/M01060401/list",
      {
        params: { s_idx: _id },
      }
    );

    const $ = cheerio.load(data);

    const articles = $(".tch-thumbnail a");
    if (articles.length === 0) return null;
    const titles = $(".usm-cont-album-art dt a");
    const teacherAndCreatedAt = $(".tch-nme");

    let articleIdArray = [];
    let articleUrlArray = [];
    let articleTitleArray = [];
    let articleTeacherArray = [];
    let articleCreatedAtArray = [];

    const regex = /\/(\d+)\?/;

    articles.map((i, e) => {
      articleIdArray.push(e.attribs.href.match(regex)[1]);
      articleUrlArray.push(e.attribs.href);
    });

    titles.map((i, e) => articleTitleArray.push($(e).text()));

    teacherAndCreatedAt.map((i, e) => {
      const teacherAndCreatedAtText = $(e).text().replace(/\s+/g, "");
      const teacher = teacherAndCreatedAtText.split("|")[0];
      const createdAt = moment(
        teacherAndCreatedAtText.split("|")[1],
        "YY.MM.DD"
      );

      articleTeacherArray.push(teacher);
      articleCreatedAtArray.push(createdAt);
    });

    return {
      id: articleIdArray,
      url: articleUrlArray,
      title: articleTitleArray,
      teacher: articleTeacherArray,
      createdAt: articleCreatedAtArray,
    };
  }

  async function getPhotosAndSaveToDB(_id, _url, _title, _teacher, _createdAt) {
    const { data } = await axios.get("https://school.cbe.go.kr" + _url);

    const $ = cheerio.load(data);

    const photoArray = $(".usm-editor-img img, .usm-editor-view img");
    let srcArray = [];

    if (photoArray.length > 0) {
      // console.log(photoArray[0].attribs);
      photoArray.map(async (i, e) => {
        console.log(e.attribs.src);
        if (e.attribs.src.startsWith("/")) {
          srcArray.push("https://school.cbe.go.kr" + e.attribs.src);
        } else {
          srcArray.push(e.attribs.src);
        }
      });

      await SchoolPhoto.updateOne(
        { _id: _id },
        {
          url: _url,
          title: _title,
          photos: srcArray,
          createdAt: _createdAt,
        },
        { upsert: true }
      );
    }
  }
};
