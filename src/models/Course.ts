import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const courseSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    authorId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["incomplete", "complete", "pending_review", "published"],
      default: "incomplete",
    },
    type: {
      type: String,
      enum: ["course", "ebook", "payment"],
      default: "course",
    },
    workspaceId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    thumbnailURL: {
      type: String,
    },
    productURL: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    frequency: {
      type: String,
      enum: ["lifetime", "monthly"],
    },
    guarantee: {
      type: String,
      enum: ["7d", "14d", "30d"],
    },
    emailSupport: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "BRL",
    },
  },
  { timestamps: true }
);

courseSchema.plugin(mongoosePaginate);

export default mongoose.model("Course", courseSchema);
