import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const workspaceMemberSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    invitorId: {
      type: String,
    },
    userId: {
      type: String,
    },
    workspaceId: {
      type: String,
    },
    role: {
      enum: ["Collaborator", "Admin"],
      default: "Collaborator",
      type: String,
    },
  },
  { timestamps: true }
);

workspaceMemberSchema.plugin(mongoosePaginate);

export default mongoose.model("WorkspaceMember", workspaceMemberSchema);
