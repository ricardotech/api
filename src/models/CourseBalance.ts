import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const courseBalanceSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

courseBalanceSchema.plugin(mongoosePaginate);

export default mongoose.model("CourseBalance", courseBalanceSchema);
