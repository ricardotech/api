import mongoose from "mongoose";

const workspace2FSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    invitorId: {
      type: String,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    role: {
      enum: ["Collaborator", "Admin"],
      default: "Collaborator",
      type: String
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkspaceInvite", workspace2FSchema);
