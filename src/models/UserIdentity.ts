import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userIdentitySchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    userId: {
      type: String,
    },
    fullName: {
      type: String,
    },
    entity: {
      type: String,
      enum: ["cnpj", "cpf"],
    },
    document: {
      type: String,
    },
    birthday: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      address: String,
      zipCode: String,
      neighborhood: String,
      city: String,
      state: String,
      number: String,
    },
    selfieURL: {
      type: String,
    },
    frontIdURL: {
      type: String,
    },
    backIdURL: {
      type: String,
    },
    status: {
      type: String,
      enum: ["incomplete", "complete", "pending", "verified"],
      default: "incomplete",
    },
  },
  { timestamps: true }
);

userIdentitySchema.plugin(mongoosePaginate);

export default mongoose.model("UserIdentity", userIdentitySchema);
