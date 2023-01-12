const mongoose = require("mongoose");

require("./user");
require("./meal");
require("./registerCode");
require("./feed");
require("./community");
require("./banner");
require("./pushToken");

mongoose.connect(process.env.MONGO_URI, {
  auth: { authSource: "admin" },
  dbName: "kch-app",
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASSWORD,
});

const mongo = mongoose.connection;

mongo.on("error", (err) => {
  console.log("DB Connection Lost!");
  console.log(err);
});

mongo.once("open", () => {
  console.log("DB Connected!");
});
