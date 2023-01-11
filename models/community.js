const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    status: { type: String },
    title: { type: String },
    content: { type: String },
    likes: [],
    comments: [],
    images: [],
    publisher: { type: String },
  },
  { timestamps: true, versionKey: false }
);
//communitySchema.index({ _id: 1 });

module.exports = mongoose.model("Community", communitySchema);
