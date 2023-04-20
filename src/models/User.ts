import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["member", "instructor"],
      default: "member"
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    thumbnail: {
      type: String,
    },
    password: {
      type: String,
      min: 6,
      max: 64,
    },
    config: {
      introVisualized: Boolean,
      default: {
        introVisualized: false,
      },
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

export default mongoose.model("User", userSchema);
