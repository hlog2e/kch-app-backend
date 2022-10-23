const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    _id: { type: String },
    meals: [
      {
        _id: { type: String },
        type: { type: String, required: true, trim: true },
        menu: [],
        kcal: { type: String },
      },
    ],
  },
  { timestamps: false, versionKey: false }
);
//mealSchema.index({ _id: 1 });

module.exports = mongoose.model("Meal", mealSchema);
