import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import User from "../models/User";
import bcrypt from "bcrypt";

import { v4 as uuid } from "uuid";
import { transporter } from "../utils/nodemailer";

export async function create(req: Request, res: Response) {
  try {
    const { courseId, email } = req.body;

    // get user email from body
    // customer_id = findOne Vindi Customers from email
    //  if !customer_id return user nÃ£o existe
    // findOne Vindi Subscription from customer_id
    //  if !subscription return subscription invÃ¡lida

    // only make the axios.post if
    // Vindi /subscriptions

    const emailLower = String(email).toLowerCase();

    const userExists: any = await User.findOne({ email: emailLower }).lean();

    if (!courseId) {
      return res
        .status(401)
        .json({ error: true, message: "courseId is missing" });
    }

    if (!email) {
      return res
        .status(401)
        .json({ error: true, message: "userId is missing" });
    }

    if (userExists && userExists._id) {
      const id = String(userExists._id).split(`"`)[0];

      const subscriptionExists = await Subscription.findOne({
        userId: id,
        courseId,
      }).lean();

      if (subscriptionExists) {
        const info = await transporter.sendMail({
          from: "Membros <suporte@membros.me>", // sender address
          to: [emailLower], // list of receivers
          subject: "Seu novo curso jÃ¡ estÃ¡ disponÃ­vel", // Subject line
          html: `<p>Olá¡ novo membro,</p><br/><p>Parabéns pela sua nova na Membros!<br/>Temos o prazer de informar que o seu curso jÃ¡ estÃ¡ disponÃ­vel e você pode acessá-lo agora mesmo usando o link abaixo/p><br/><a href="https://app.membros.me/curso/${courseId}">Acessar curso</a><br/><br/><p>O curso que você adquiriu foi cuidadosamente criado para oferecer uma experiência educativa incrível e transformadora, repleta de conteúdo atualizado e ferramentas interativas. Acreditamos que você irá¡ adorar!</p><br/><p>Se precisar de ajuda em qualquer momento durante o curso, nossa equipe de suporte ao cliente estÃ¡ disponÃ­vel 24 horas por dia, 7 dias por semana.<br/>Fique Ã  vontade para entrar em contato conosco se precisar de assistÃªncia.</p><br/><p>Obrigado por escolher a Membros para sua jornada educacional e esperamos que você aproveite ao mÃ¡ximo o seu novo curso.</p><br/><p>Atenciosamente,</p><br/><p>Ricardo Fonseca</p><br/><p>Equipe Membros</p>`,
        });

        console.log(
          "Message sent to user exists and subscription exists",
          email
        );
        return res.json(subscriptionExists);
      } else {
        const subscription = new Subscription({
          userId: id,
          courseId,
        });
        await subscription.save();
        const info = await transporter.sendMail({
          from: "Membros <suporte@membros.me>", // sender address
          to: [emailLower], // list of receivers
          subject: "ParabÃ©ns! Seu novo curso estÃ¡ pronto para comeÃ§ar!", // Subject line
          html: `<p>OlÃ¡ novo membro,</p><br/><p>ParabÃ©ns pela sua nova aquisiÃ§Ã£o de curso na Membros!<br/>Temos o prazer de informar que o seu curso jÃ¡ estÃ¡ disponÃ­vel e vocÃª pode acessÃ¡-lo agora mesmo usando o link abaixo/p><br/><a href="https://app.membros.me/curso/${courseId}">Acessar curso</a><br/><br/><p>O curso que vocÃª adquiriu foi cuidadosamente criado para oferecer uma experiÃªncia educativa incrÃ­vel e transformadora, repleta de conteÃºdo atualizado e ferramentas interativas. Acreditamos que vocÃª irÃ¡ adorar!</p><br/><p>Se precisar de ajuda em qualquer momento durante o curso, nossa equipe de suporte ao cliente estÃ¡ disponÃ­vel 24 horas por dia, 7 dias por semana.<br/>Fique Ã  vontade para entrar em contato conosco se precisar de assistÃªncia.</p><br/><p>Obrigado por escolher a Membros para sua jornada educacional e esperamos que vocÃª aproveite ao mÃ¡ximo o seu novo curso.</p><br/><p>Atenciosamente,</p><br/><p>Ricardo Fonseca</p><br/><p>Equipe Membros</p>`,
        });

        console.log(
          "Message sent to userExistent but no subscription",
          emailLower
        );
        return res.json(subscription);
      }
    } else {
      const password = uuid();
      const crypted_password = await bcrypt.hash(password, 10);

      const user = new User({
        email: emailLower,
        password: crypted_password,
      });
      await user.save();

      const subscription = new Subscription({
        userId: user._id,
        courseId,
      });
      await subscription.save();

      const info = await transporter.sendMail({
        from: "Membros <suporte@membros.me>", // sender address
        to: [emailLower], // list of receivers
        subject: "Seu novo curso jÃ¡ estÃ¡ disponÃ­vel", // Subject line
        html: `<p>OlÃ¡ novo membro,</p><br/><p>ParabÃ©ns pela sua nova aquisiÃ§Ã£o de curso na Membros!<br/>Temos o prazer de informar que o seu curso jÃ¡ estÃ¡ disponÃ­vel e vocÃª pode acessÃ¡-lo agora mesmo usando as credenciais abaixo:</p><div style="margin-top: 20px;margin-bottom: 20px;border-radius: 5px; padding: 10px;background: #EEE"><p>Seu email: ${email}</p><p>Sua senha: ${password}</p></div><a href="https://app.membros.me/curso/${courseId}">Acessar curso</a><br/><br/><p>O curso que vocÃª adquiriu foi cuidadosamente criado para oferecer uma experiÃªncia educativa incrÃ­vel e transformadora, repleta de conteÃºdo atualizado e ferramentas interativas. Acreditamos que vocÃª irÃ¡ adorar!</p><br/><p>Se precisar de ajuda em qualquer momento durante o curso, nossa equipe de suporte ao cliente estÃ¡ disponÃ­vel 24 horas por dia, 7 dias por semana.<br/>Fique Ã  vontade para entrar em contato conosco se precisar de assistÃªncia.</p><br/><p>Obrigado por escolher a Membros para sua jornada educacional e esperamos que vocÃª aproveite ao mÃ¡ximo o seu novo curso.</p><br/><p>Atenciosamente,</p><br/><p>Ricardo Fonseca</p><br/><p>Equipe Membros</p>`,
      });

      console.log("Message sent to no user no subscription", emailLower);

      return res.json({
        success: true,
        subscription,
      });
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params;

    const lesson: any = await Subscription.find({ courseId }).lean();

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const lesson: any = await Subscription.find({ userId }).lean();

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function readByExists(req: any, res: Response) {
  try {
    const { courseId } = req.params;

    const userId = req.userId;

    const lesson: any = await Subscription.findOne({ userId, courseId }).lean();

    if (!lesson) {
      res.status(203).json("User nÃ£o tem acesso ao curso.");
    } else {
      res.json(lesson);
    }
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const lesson = await Subscription.findByIdAndDelete(id);

    res.json(lesson);
  } catch (e) {
    return res.status(500).json({ status: "Error!", e });
  }
}
