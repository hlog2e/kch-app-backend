const mongoose = require("mongoose");

const communityBoardSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    iconName: { type: String, default: "newspaper-outline" },
    role: [],
    createdBy: { type: String },
  },
  { timestamps: true, versionKey: false }
);
//communityBoardSchema.index({ _id: 1 });

module.exports = mongoose.model("CommunityBoard", communityBoardSchema);
