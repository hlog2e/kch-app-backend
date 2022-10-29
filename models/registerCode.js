const mongoose = require("mongoose");

const registerCodeSchema = new mongoose.Schema(
  {
    _id: { type: String, maxLength: 5 },
    isUsed: { type: Boolean, required: true },
    usedUser: { type: String },
    issur: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("RegisterCode", registerCodeSchema);
