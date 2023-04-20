import { Request } from "express";
import Bill from "../models/Bill";
import Coproductor from "../models/Coproductor";
import Course from "../models/Course";
import User from "../models/User";
import UserBalance from "../models/UserBalance";

export async function create(req: any, res: any) {
  try {
    console.log(req.hostname);

    // validate hostname

    const {
      availableAt,
      customer,
      courseId,
      amount,
      installments,
      status,
      chargeId,
      billId,
      paymentMethod,
    } = req.body;

    console.log(req.body);

    const b_exists = await Bill.findOne({
      courseId,
      billId,
      chargeId,
      amount,
    }).lean();

    if (b_exists) {
      return res.status(203).json({
        error: true,
        message: "Essa bill já foi registrada.",
      });
    }

    if (!billId) {
      return res.status(203).json({ error: true, message: "Bill is missing" });
    }

    if (!customer) {
      return res
        .status(203)
        .json({ error: true, message: "Customer is missing" });
    }

    // esse aqui adiciona saldo mesmo sem ter liberado

    // const coproductors = await Coproductor.find({
    //   courseId,
    // }).lean();

    // await Promise.all(
    //   coproductors.map(async (coproductor, i) => {
    //     const userBalance = await UserBalance.findOne({
    //       userId: coproductor.userId,
    //     });

    //     if (!userBalance) {
    //       const newUserBalance = new UserBalance({
    //         balance: Number(amount),
    //         userId: coproductor.userId,
    //       });

    //       await newUserBalance.save();
    //     } else {
    //       userBalance.balance += amount;
    //       await userBalance.save();
    //     }
    //   })
    // );

    const bill = new Bill({
      availableAt,
      customer,
      courseId,
      amount,
      installments,
      status,
      chargeId,
      billId,
      paymentMethod,
    });

    await bill.save();

    return res.json(bill);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function getBillsByCourseId(req: any, res: any) {
  try {
    const userId = req.userId;

    const { page } = req.query;

    const pageNumber = parseInt(page, 10) || 1;

    const { courseId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(203).json("Usuário não existe");
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("Curso não existe");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("Curso não é seu!");
    }

    const bills = await Bill.paginate(
      {
        courseId,
      },
      { page: pageNumber, limit: 10 }
    );

    if (!bills) {
      return res.status(203).json("Nenhuma bill encontrada.");
    }

    return res.json(bills);
  } catch (e) {}
}
