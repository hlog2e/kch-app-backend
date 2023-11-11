const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    publisher: { type: Object },
    content: { type: String },
    images: [],
  },
  { timestamps: true, versionKey: false }
);
//feedSchema.index({ _id: 1 });

module.exports = mongoose.model("Feed", feedSchema);
