const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    uri: { type: String },
    link: { type: String },
  },
  { timestamps: false, versionKey: false }
);
//bannerSchema.index({ _id: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
