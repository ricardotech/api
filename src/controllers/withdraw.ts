import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import UserIdentity from "../models/UserIdentity";
import bcrypt from "bcrypt";
import Withdraw2F from "../models/Withdraw2F";
import Withdraw from "../models/Withdraw";
import User from "../models/User";
import { transporter } from "../utils/nodemailer";
import { client } from "../utils/telesign";
import CourseBalance from "../models/CourseBalance";
import Course from "../models/Course";

export async function requestWithdraw(
  req: any,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId;

  const { courseId, amount } = req.body;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(403).json("Esse usuário não existe.");
  }

  const course = await Course.findById(courseId).lean();

  if (!course) {
    return res.status(403).json("Esse curso não existe.");
  }

  if (course.authorId !== userId) {
    return res.status(403).json("Esse curso não é seu.");
  }

  const userIdentity = await UserIdentity.findOne({
    userId,
  }).lean();

  if (!userIdentity) {
    return res
      .status(403)
      .json("Esse usuário não possui uma identidade cadastrada.");
  } else if (userIdentity) {
    if (userIdentity.status === "verified") {
      const balance = await CourseBalance.findOne({
        courseId,
      }).lean();

      if (!balance) {
        console.log(balance);
        return res.status(403).json("Esse usuá¡rio não possui saldo.");
      }

      console.log(balance);
      if (Number(balance.balance) < amount) {
        return res
          .status(203)
          .json("Esse usuário não possui saldo disponível.");
      }

      const withdraw = new Withdraw({
        courseId,
        userId,
        amount,
        userIdentityId: userIdentity._id,
      });
      await withdraw.save();

      const emailCode = String(Math.floor(100000 + Math.random() * 900000));
      const crypted_emailCode = await bcrypt.hash(emailCode, 10);

      const smsCode = String(Math.floor(100000 + Math.random() * 900000));
      const crypted_smsCode = await bcrypt.hash(smsCode, 10);

      const e_withdraw2f = await Withdraw2F.findOne({
        emailCode: crypted_emailCode,
        smsCode: crypted_smsCode,
        withdrawId: withdraw._id,
      });

      if (e_withdraw2f) {
        await Withdraw2F.findOneAndDelete({
          emailCode: crypted_emailCode,
          smsCode: crypted_smsCode,
          withdrawId: withdraw._id,
        });
      }

      const withdraw2f = new Withdraw2F({
        emailCode: crypted_emailCode,
        smsCode: crypted_smsCode,
        withdrawId: withdraw._id,
      });
      await withdraw2f.save();

      console.log(process.env.SMTP_AUTH_PASS);

      // - send this 6 digit random code in email
      const sendEmailCode = await transporter.sendMail({
        from: "Membros <suporte@membros.me>", // sender address
        to: user.email, // list of receivers
        subject: `Seu código de verificação`, // Subject line
        html: `<p>Seu código de verificação: <span style="font-size: 16px;font-weight: bold;">${emailCode}</span></p>`,
      });

      console.log(`Messaging response for email address: ${sendEmailCode}`);

      // - send this 6 digit random code in sms

      const userPhoneNumber = `+55${String(userIdentity.phoneNumber)
        .toString()
        .replace(/\D/g, "")}`;

      const phoneNumber = userPhoneNumber;
      const message = `Membros: ${smsCode}`;
      const messageType = "ARN";

      function messageCallback(error: any, responseBody: any) {
        if (error === null) {
          console.log(
            `Messaging response for messaging phone number: ${phoneNumber}` +
              ` => code: ${responseBody["status"]["code"]}` +
              `, description: ${responseBody["status"]["description"]}`
          );
        } else {
          console.error("Unable to send sms message. " + error);
          return res
            .status(403)
            .json("Não foi possisvel enviar o código de verificação.");
        }
      }

      await client.sms.message(
        messageCallback,
        phoneNumber,
        message,
        messageType
      );

      return res.status(200).json(withdraw._id);
    } else {
      return res
        .status(403)
        .json("Esse usuÃ¡rio não possui uma identidade verificada.");
    }
  }
}

export async function verifyWithdraw2F(
  req: any,
  res: Response,
  next: NextFunction
) {
  // limit the amount of input entries for 5 attempts

  const userId = req.userId;

  const user = await User.findById(userId).lean();

  if (!user) {
    return res.status(203).json("Essa usuário não existe.");
  }

  const { smsCode, emailCode, withdrawId } = req.body;

  const withdraw = await Withdraw.findById(withdrawId).lean();

  if (!withdraw) {
    return res.status(203).json("Essa solicitaÃ§Ã£o não existe.");
  }

  if (userId !== withdraw.userId) {
    return res.status(203).json("Essa solicitação não é sua.");
  }

  const withdraw2f = await Withdraw2F.findOne({
    withdrawId: withdrawId,
  }).lean();

  if (!withdraw2f) {
    return res.status(203).json("Essa solicitaÃ§Ã£o de 2F nÃ£o existe.");
  }

  const emailCodeValid = await bcrypt.compare(
    String(emailCode),
    String(withdraw2f.emailCode)
  );
  const smsCodeValid = await bcrypt.compare(
    String(smsCode),
    String(withdraw2f.smsCode)
  );

  if (!emailCodeValid) {
    return res.status(203).json("Esse cÃ³digo nÃ£o Ã© valido.");
  }

  if (!smsCodeValid) {
    return res.status(203).json("Esse cÃ³digo nÃ£o Ã© valido.");
  }

  if (emailCodeValid && smsCodeValid) {
    await Withdraw.findByIdAndUpdate(
      withdrawId,
      {
        status: "pending",
      },
      { useFindAndModify: true, new: true },
      function (err: any, docs: any) {
        if (err) {
          return res.json({ error: true, message: "falhou no mongoose" });
        } else {
          Withdraw2F.findOneAndDelete({
            withdrawId,
          }).then(async () => {
            await transporter.sendMail({
              from: "Membros <suporte@membros.me>",
              to: user.email,
              subject: `Solicitação de saque`,
              html: `<p>solicitação de saque realizada com sucesso no valor de: <span style="font-size: 16px;font-weight: bold;">${Number(
                withdraw.amount
              ).toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}}</span></p>`,
            });

            await transporter.sendMail({
              from: "Membros <suporte@membros.me>",
              to: "suporte@membros.me",
              subject: `Solicitação de saque`,
              html: `<p>Verificar saque (${
                withdraw._id
              }) no valor de: <span style="font-size: 16px;font-weight: bold;">${Number(
                withdraw.amount
              ).toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}}</span></p>`,
            });

            return res.json("Withdraw2F verificado com sucesso!");
          });
        }
      }
    )
      .clone()
      .catch((error: any) => {
        return res.json({ error: true, message: "falhou no mongoose" });
      });
  }
}

export async function getWithdrawsByUserId(
  req: any,
  res: Response,
  next: NextFunction
) {
  // limit the amount of input entries for 5 attempts

  const { courseId } = req.params;

  console.log(courseId);

  const userId = req.userId;

  const withdraws = await Withdraw.find({
    courseId,
    userId,
  }).lean();

  if (!withdraws) {
    return res.status(203).json("Essa solicitação não existe.");
  }

  const thresholdDate = new Date(Date.now() - 3 * 60 * 1000); // data de 3 minutos atrás

  Withdraw.deleteMany(
    {
      userId: userId,
      status: "requested",
      createdAt: { $lt: thresholdDate },
    },
    function (err) {
      if (err) {
        console.log("Erro ao deletar as instâncias da coleção Withdraw:", err);
      } else {
        console.log("Instâncias da coleção Withdraw deletadas com sucesso.");
      }
    }
  );

  return res.json(withdraws);
}
