import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const lessonDoneSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    moduleId: {
      type: String
    },
    lessonId: {
      type: String,
    },
    userId: {
      type: String,
    },
    done: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

lessonDoneSchema.plugin(mongoosePaginate);

export default mongoose.model("LessonDone", lessonDoneSchema);
