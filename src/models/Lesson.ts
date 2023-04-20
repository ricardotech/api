import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const lessonSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    index: {
      type: Number,
    },
    moduleId: {
      type: String,
    },
    title: {
      type: String,
    },
    contentUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

lessonSchema.plugin(mongoosePaginate);

export default mongoose.model("Lesson", lessonSchema);
