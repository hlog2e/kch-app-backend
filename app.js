const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const schedule = require("node-schedule");

//Mongo DB
require("./models");

const getMeals = require("./schedule/getMeals"); // 1개월 단위로 급식데이터 불러오기 위한 스케줄 함수
const getWeatherAndNotify = require("./schedule/getWeatherAndNotify");
const notifyMealLaunch = require("./schedule/notifyMealLaunch");
const getPhotosFromHomepage = require("./schedule/getPhotosFromHomepage");
const getNoticesFromHomepage = require("./schedule/getNoticesFromHomepage");

if (process.env.INSTANCE_VAR === "0") {
  schedule.scheduleJob("30 7 * * 1-5", () => {
    getWeatherAndNotify();
  });
  // 월~금 오전 08시 00분 마다 중식 알림 보내기
  schedule.scheduleJob("00 08 * * 1-5", () => {
    notifyMealLaunch();
  });
  // 매월 1일 오전 2시 마다 급식 정보를 서버로 캐싱
  schedule.scheduleJob("0 2 1 * *", () => {
    getMeals();
  });
  // 1일에 급식 데이터 못불러왔을때 3일 오후 12시에 다시 불러옴
  schedule.scheduleJob("0 12 3 * *", () => {
    getMeals();
  });
  // 30분 마다 학교 활동사진 업데이트
  schedule.scheduleJob("0,30 * * * *", () => {
    getPhotosFromHomepage();
  });
  //10,40분 마다 학교 공지사항 업데이트
  schedule.scheduleJob("10,40 * * * *", () => {
    getNoticesFromHomepage();
  });
}

// CORS
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.indexOf(origin) !== -1) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error("Not allowed by CORS"));
  //     }
  //   },
  origin: "*", //For All Allow
  credentials: true,
};
app.use(cors(corsOptions));

//express init
app.use(express.json());
const moment = require("moment");
morgan.token("auth-token", (req, res) => {
  return JSON.stringify(req.headers.authorization);
});
morgan.token("ko-datetime", (req, res) => {
  return moment().format("YYYY-MM-DD hh:mm:ss.SSS A Z");
});
morgan.token("req-body", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    '[IP : :remote-addr] [:ko-datetime] [:method|HTTP/:http-version|":url"|:status] [Agent:":user-agent"] [Authorization: :auth-token] [Body: :req-body] [res-length::res[content-length] referrer:":referrer"]'
  )
);
app.use(helmet());
app.use(cookieParser());
app.set("trust proxy", "127.0.0.1");

const mainRouter = require("./routers");

//For Uptime Checker
app.get("/", (req, res) => {
  res.json({ status: 200, message: "Welcome" });
});
app.use(mainRouter);

//에러 핸들링
app.use((req, res, next) => {
  res.status(404).send({ status: 404, message: "올바르지 않은 접근입니다." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ status: 500, message: "internal error" });
});

app.listen(3001, "0.0.0.0", () => {
  console.log("on 3001");
});
