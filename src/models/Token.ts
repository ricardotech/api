import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Token", tokenSchema);