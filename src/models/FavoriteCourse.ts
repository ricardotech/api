import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const favoriteCourseSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

favoriteCourseSchema.plugin(mongoosePaginate);

export default mongoose.model("FavoriteCourse", favoriteCourseSchema);
