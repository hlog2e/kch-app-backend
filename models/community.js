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
    publisher: { type: Schema.Types.ObjectId, ref: "User" },
    isAnonymous: { type: Boolean },
    reports: [{ type: Schema.Types.ObjectId }],
    boardId: { type: Schema.Types.ObjectId },
    category: { type: String, default: "general" },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 기본적으로 publisher 정보를 populate
communitySchema.pre(/^find/, function () {
  this.populate("publisher", "name desc");
});

//communitySchema.index({ _id: 1 });

module.exports = mongoose.model("Community", communitySchema);
