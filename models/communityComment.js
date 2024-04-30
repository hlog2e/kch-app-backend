const { Schema, mongoose } = require("mongoose");

const communityCommentSchema = new mongoose.Schema(
  {
    status: { type: String },
    communityId: { type: Schema.Types.ObjectId },
    comment: { type: String },
    issuer: { type: Schema.Types.ObjectId },
    issuerName: { type: String },
    issuerDesc: { type: String },
    isAnonymous: { type: Boolean },
    reports: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true, versionKey: false }
);
//communityCommentSchema.index({ _id: 1 });

module.exports = mongoose.model("CommunityComment", communityCommentSchema);
