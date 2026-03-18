const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["undergraduate", "teacher", "graduate"],
    },
    name: { type: String, required: true },
    birthYear: String,
    image: { type: String, required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    rejectedReason: String,
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model(
  "VerificationRequest",
  verificationRequestSchema,
);
