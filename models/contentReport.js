const { Schema, mongoose } = require("mongoose");

const contentReportSchema = new mongoose.Schema(
  {
    targetType: { type: String, required: true, enum: ["post", "comment"] },
    targetId: { type: Schema.Types.ObjectId, required: true },
    // 댓글 신고 시 소속 게시물, 게시물 신고 시 targetId와 동일
    communityId: { type: Schema.Types.ObjectId },
    reporters: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "hidden", "dismissed"],
    },
    notifyAttempts: { type: Number, default: 0 },
    lastNotifiedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("ContentReport", contentReportSchema);
