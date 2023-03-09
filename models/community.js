const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    status: { type: String },
    title: { type: String },
    content: { type: String },
    likes: [],
    likeCount: { type: Number, default: 0 },
    comments: [],
    commentCount: { type: Number, default: 0 },
    views: { type: Number },
    images: [],
    publisher: { type: String },
    publisherName: { type: String },
    publisherGrade: { type: String },
  },
  { timestamps: true, versionKey: false }
);
//communitySchema.index({ _id: 1 });

module.exports = mongoose.model("Community", communitySchema);
