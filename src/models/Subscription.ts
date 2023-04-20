import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const subscriptionsSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    userId: {
      type: String,
    },
    courseId: {
      type: String,
    },
  },
  { timestamps: true }
);

subscriptionsSchema.plugin(mongoosePaginate);

export default mongoose.model("Subscriptions", subscriptionsSchema);
