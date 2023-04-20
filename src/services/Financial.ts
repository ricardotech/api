import Bill from "../models/Bill";
import Withdraw from "../models/Withdraw";
import CourseBalance from "../models/CourseBalance";

// faturamento
// quanto o custo tem de lançamento futuro: int
// quanto o custo tem de saldo (bills.available - withdraws): int
// quantas vendas foram realizadas naquele curso: int

const today = new Date();
const startOfDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
const endOfDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);

const startOfDayISO = startOfDay.toISOString();
const endOfDayISO = endOfDay.toISOString();

export async function getCourseAvailableBalance() {
  const totalBalance = await Bill.aggregate([
    {
      $match: {
        availableAt: {
          $lt: endOfDayISO,
        },
      },
    },
    {
      $group: {
        _id: "$courseId",
        totalBillsAmount: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "withdraws",
        localField: "_id",
        foreignField: "courseId",
        as: "withdraws",
      },
    },
    {
      $project: {
        courseId: "$_id",
        bills: "$totalBillsAmount",
        withdraws: { $sum: "$withdraws.amount" },
        balance: {
          $subtract: ["$totalBillsAmount", { $sum: "$withdraws.amount" }],
        },
      },
    },
  ]);

  for (const { courseId, balance, bills, withdraws } of totalBalance) {
    const fee = 5.99;
    const count = (balance / 100) * (100 - fee);
    const balanceValue = count.toFixed(2);

    // get coproduction
    // UserBalance.findOneAndUpdate instead of CourseBalance.findOneAndUpdata

    await CourseBalance.findOneAndUpdate(
      { courseId },
      { balance: balanceValue },
      { upsert: true }
    );
  }

  console.log("Course balances updated successfully.");
}
