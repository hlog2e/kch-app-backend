const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: { type: String },
    post_id: { type: String },
    comment_id: { type: String },
    issuer: { type: String },
    status: { type: String },
  },
  { timestamps: true, versionKey: false }
);
//reportSchema.index({ _id: 1 });

module.exports = mongoose.model("Report", reportSchema);
