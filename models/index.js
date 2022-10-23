const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connect Success");
  })
  .catch((err) => console.log(err));
