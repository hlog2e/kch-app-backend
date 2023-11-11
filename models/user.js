const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 11,
    },
    name: { type: String, required: true },
    desc: String,
    profilePhoto: String,
    type: { type: String, required: true },
    blockedUsers: [],
    notifications: {
      type: Array,
      default: ["meal", "weather", "feed", "community"],
    },
    //아래는 재학생일 경우에만 필요한 Data
    birthYear: String,
    idPhoto: String,
    barcode: String,
    timetable: [],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);
//userSchema.index({ email: 1, nickname: 1 });

module.exports = mongoose.model("User", userSchema);
