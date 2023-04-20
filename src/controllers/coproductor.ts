import { NextFunction, Request, Response } from "express";

import UserIdentity from "../models/UserIdentity";
import bcrypt from "bcrypt";
import Withdraw2F from "../models/Withdraw2F";
import Withdraw from "../models/Withdraw";
import User from "../models/User";
import { transporter } from "../utils/nodemailer";
import { client } from "../utils/telesign";
import Course from "../models/Course";
import Coproductor from "../models/Coproductor";

export async function addCoProductor(
  req: any,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId;

  const { courseId } = req.params;

  const { percentage, email, name, position } = req.body;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(203).json("Inválido.");
  }

  const course = await Course.findById(courseId).lean();

  if (!course) {
    return res.status(203).json("Esse curso não existe.");
  }

  if (course.authorId !== userId) {
    return res.status(403).json("Esse curso não é seu.");
  }

  const e_coproductor = await Coproductor.findOne({
    courseId,
    email,
  });

  if (e_coproductor) {
    return res.status(203).json("Já é um co-produtor desse curso.");
  }

  const coproductor = new Coproductor({
    courseId,
    creatorId: userId,
    percentage,
    email,
    name,
    position,
  });

  await coproductor.save();

  return res.status(200).json("Co-produtor adicionado com sucesso!");
}

export async function getCoProductorsByCourseId(
  req: any,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId;

  const { courseId } = req.params;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(203).json("Inválido.");
  }

  const course = await Course.findById(courseId).lean();

  // if (!course) {
  //   return res.status(203).json("Esse curso não existe.");
  // }

  // if (String(course.authorId) !== userId) {
  //   return res.status(403).json("Inválido.");
  // }

  const coproductors = await Coproductor.find({
    courseId,
  });

  return res.status(200).json(coproductors);
}

export async function getCoProductions(
  req: any,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(203).json("Esse usuÃ¡rio nÃ£o existe.");
  }

  const coproductions = await Coproductor.find({
    email: user.email,
  });

  return res.status(200).json(coproductions);
}

export async function removeCoProductor(
  req: any,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId;

  const { courseId, userEmail } = req.params;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(203).json("Esse usuário não existe.");
  }

  const course = await Course.findById(courseId).lean();

  if (!course) {
    return res.status(203).json("Esse curso não existe.");
  }

  if (course.authorId !== userId) {
    return res.status(403).json("Esse curso não é seu.");
  }

  await Coproductor.findOneAndDelete({
    email: userEmail,
    courseId,
  });

  return res.status(200).json("Co-produtor removido com sucesso!");
}
