const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    _id: { type: String },
    publisher: { type: Object },
    desc: { type: String },
    images: [],
  },
  { timestamps: true, versionKey: false }
);
//feedSchema.index({ _id: 1 });

module.exports = mongoose.model("Feed", feedSchema);
