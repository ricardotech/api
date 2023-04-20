import mongoose, { Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IBill extends Document {
  availableAt: string;
  customer: {
    id: number;
    phone?: string;
    name: string;
    email: string;
  };
  courseId: string;
  amount: number;
  installments: number;
  status: string;
  chargeId: number;
  billId: number;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new mongoose.Schema(
  {
    availableAt: { type: String },
    customer: {
      id: Number,
      name: String,
      email: String,
      phone: String,
    },
    courseId: { type: String },
    amount: { type: Number },
    installments: { type: Number },
    status: { type: String },
    chargeId: { type: Number },
    billId: { type: Number },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

billSchema.plugin(mongoosePaginate);

const Bill: PaginateModel<IBill> = mongoose.model<IBill, PaginateModel<IBill>>(
  "Bill",
  billSchema
);

export default Bill;
