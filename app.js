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
require("./models/redis");

const getMeals = require("./schedule/getMeals"); // 1개월 단위로 급식데이터 불러오기 위한 스케줄 함수

if (process.env.INSTANCE_VAR === "0") {
  schedule.scheduleJob("0 0 23 * *", () => {
    getMeals();
  });
}

//For Uptime Checker
app.get("/", (req, res) => {
  console.log(req.headers);
  res.json({ status: 200, message: "Welcome" });
});

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
app.use(morgan);
app.use(helmet());
app.use(cookieParser());
app.set("trust proxy", "127.0.0.1");

const mainRouter = require("./routers");

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
