import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const moduleSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    index: {
      type: Number
    },
    courseId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
  },
  { timestamps: true }
);

moduleSchema.plugin(mongoosePaginate);

export default mongoose.model("Module", moduleSchema);
