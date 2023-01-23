const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema(
  {
    _id: { type: String },
    user_id: { type: String },
  },
  { timestamps: true, versionKey: false, collection: "push_tokens" }
);

module.exports = mongoose.model("PushToken", pushTokenSchema);
