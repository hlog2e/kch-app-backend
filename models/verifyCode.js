const mongoose = require("mongoose");

const verifyCodeSchema = new mongoose.Schema(
  {
    _id: String,
    code: String,
    isUsed: Boolean,
    expire: Date,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("VerifyCode", verifyCodeSchema);
