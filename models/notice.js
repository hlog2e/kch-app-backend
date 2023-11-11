const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    title: { type: String },
    url: { type: String },
    teacher: { type: String },
    html: { type: String },
    createdAt: { type: Date },
  },
  { timestamps: false, versionKey: false }
);
//noticeSchema.index({ _id: 1 });

module.exports = mongoose.model("Notice", noticeSchema);
