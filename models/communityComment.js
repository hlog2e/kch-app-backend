const { Schema, mongoose } = require("mongoose");

const communityCommentSchema = new mongoose.Schema(
  {
    status: { type: String },
    communityId: { type: Schema.Types.ObjectId },
    comment: { type: String },
    issuer: { type: Schema.Types.ObjectId, ref: "User" },
    isAnonymous: { type: Boolean },
    reports: [{ type: Schema.Types.ObjectId }],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 기본적으로 issuer 정보를 populate
communityCommentSchema.pre(/^find/, function () {
  this.populate("issuer", "name desc");
});

//communityCommentSchema.index({ _id: 1 });

module.exports = mongoose.model("CommunityComment", communityCommentSchema);
