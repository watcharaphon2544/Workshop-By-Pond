const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String },
    price: { type: Number },
    image: { type: String },
    count: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Products", productSchema);
