const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 11,
    },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    class: { type: String },
    number: { type: String },
  },
  { timestamps: true }
);
//userSchema.index({ email: 1, nickname: 1 });

module.exports = mongoose.model("User", userSchema);
