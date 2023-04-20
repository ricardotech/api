import { Request } from "express";
import Bill from "../models/Bill";
import Course from "../models/Course";
import CourseBalance from "../models/CourseBalance";
import User from "../models/User";
import { getCourseAvailableBalance } from "../services/Financial";

export async function getCourseBalance(req: any, res: any) {
  try {
    const { courseId } = req.params;

    const userId = req.userId;

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(203).json("Esse curso não existe.");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(203).json("Esse usuário não existe.");
    }

    if (course.authorId !== userId) {
      return res.status(203).json("Esse curso não é seu.");
    }

    await getCourseAvailableBalance();

    const balance = await CourseBalance.findOne({
      courseId,
    }).lean();

    if (!balance) {
      return res.status(203).json("Esse curso não possui saldo.");
    }

    return res.json(balance.balance);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
