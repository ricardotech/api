import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workspaceSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    authorId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

workspaceSchema.plugin(mongoosePaginate);

export default mongoose.model("Workspace", workspaceSchema);
