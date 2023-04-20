import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userBalanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

userBalanceSchema.plugin(mongoosePaginate);

export default mongoose.model("UserBalance", userBalanceSchema);
