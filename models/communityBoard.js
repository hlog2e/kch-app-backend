const mongoose = require("mongoose");

const communityBoardSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    desc: { type: String },
    iconName: { type: String, default: "newspaper-outline" },
    role: [],
    allowAnonymous: { type: Boolean },
  },
  { timestamps: true, versionKey: false }
);
//communityBoardSchema.index({ _id: 1 });

module.exports = mongoose.model("CommunityBoard", communityBoardSchema);
