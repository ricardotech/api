import mongoose from "mongoose";

const withdraw2FSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    withdrawId: {
      type: String,
      required: true,
    },
    emailCode: {
      type: String,
      required: true,
    },
    smsCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("withdraw2FSchema", withdraw2FSchema);
