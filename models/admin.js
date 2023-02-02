const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    _id: { type: String },
    password: { type: String },
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
//adminSchema.index({ email: 1, nickname: 1 });

module.exports = mongoose.model("Admin", adminSchema);
