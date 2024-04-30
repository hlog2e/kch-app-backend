const { Schema, mongoose } = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    status: { type: String },
    title: { type: String },
    content: { type: String },
    likes: [],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: [{ type: Schema.Types.ObjectId }],
    images: [],
    publisher: { type: Schema.Types.ObjectId },
    publisherName: { type: String },
    publisherDesc: { type: String },
    isAnonymous: { type: Boolean },
    reports: [{ type: Schema.Types.ObjectId }],
    boardId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, versionKey: false }
);
//communitySchema.index({ _id: 1 });

module.exports = mongoose.model("Community", communitySchema);
