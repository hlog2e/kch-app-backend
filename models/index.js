const mongoose = require("mongoose");

require("./user");
require("./meal");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connect Success");
  })
  .catch((err) => console.log(err));
