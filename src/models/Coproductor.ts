import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const coproductorSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    creatorId: {
      type: String,
    },
    courseId: {
      type: String,
    },
    email: {
      type: String,
    },
    userId: {
      type: String,
    },
    percentage: {
      type: Number,
    },
    name: {
      type: String
    },
    position: {
      type: String
    }
  },
  { timestamps: true }
);

coproductorSchema.plugin(mongoosePaginate);

export default mongoose.model("Coproductor", coproductorSchema);
