const mongoose = require("mongoose");

const registerCodeSchema = new mongoose.Schema(
  {
    _id: { type: String, maxLength: 5 },
    isUsed: { type: Boolean, required: true },
    usedUser: { type: Object },
    issur: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: "register-codes" }
);

module.exports = mongoose.model("RegisterCode", registerCodeSchema);
