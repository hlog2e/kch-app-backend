const mongoose = require("mongoose");

const schoolPhotoSchema = new mongoose.Schema(
  {
    _id: Number,
    url: String,
    title: String,
    photos: [],
    createdAt: Date,
  },
  { timestamps: false, versionKey: false }
);
//schoolPhotoSchema.index({});

module.exports = mongoose.model("SchoolPhoto", schoolPhotoSchema);
