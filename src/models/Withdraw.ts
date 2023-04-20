import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const withdrawSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    userId: {
      type: String,
    },
    userIdentityId: {
      type: String,
    },
    courseId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["requested", "pending", "approved"],
      default: "requested",
    },
    proofURL: {
      type: String,
    },
  },
  { timestamps: true }
);

withdrawSchema.plugin(mongoosePaginate);

export default mongoose.model("Withdraw", withdrawSchema);
