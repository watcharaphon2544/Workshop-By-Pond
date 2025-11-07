const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    password: { type: String },
    email: { type: String },
    approve: { type: Boolean },
    role: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
