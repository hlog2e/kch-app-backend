const mongoose = require("mongoose");

require("./user");
require("./meal");

mongoose.connect(process.env.MONGO_URI);

const mongo = mongoose.connection;

mongo.on("error", (err) => {
  console.log("DB Connection Lost!");
  console.log(err);
});

mongo.once("open", () => {
  console.log("DB Connected!");
});
