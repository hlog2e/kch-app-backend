const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    writer: { type: String },
  },
  { timestamps: true, versionKey: false }
);
//noticeSchema.index({ _id: 1 });

module.exports = mongoose.model("Notice", noticeSchema);
