import "dotenv/config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";
import { User as UserType } from "../types/User.type";
import validator from "email-validator";

import crypto from "crypto";

import Token from "../models/Token";

import { v4 as uuid } from "uuid";
import { transporter } from "../utils/nodemailer";

const JWT_SECRET = String(process.env.JWT_SECRET);

function generateJwt(email: string, payload: UserType) {
  const token = jwt.sign(payload, JWT_SECRET);

  return {
    token,
  };
}

export const sessions = async (request: Request, response: Response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.json({
      error: true,
      code: "credentials.invalid",
      message: "Credenciais invalidas",
    });
  }

  const user: UserType = await User.findOne({ email }).lean();

  if (!user) {
    return response.json({
      error: true,
      message: "E-mail ou senha invalidos.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!user || !passwordMatch) {
    return response.json({
      error: true,
      message: "E-mail ou senha invalidos.",
    });
  }

  const { token } = generateJwt(email, {
    password: "",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    username: user.username,
  });

  const rt = uuid();

  const refreshToken = new Token({
    refreshToken: rt,
    email,
  });
  await refreshToken.save();

  return response.json({
    _id: user._id,
    name: user.name,
    token,
    refreshToken: rt,
    role: user.role,
  });
};

export const update = async (request: Request, response: Response) => {
  try {
    const key = request.params.key;
    const value = request.params.value;

    const id = request.params.userId;

    // const a = key[0];
    // const b = value[0];

    const update = { [key]: value };

    await User.findByIdAndUpdate(
      id,
      update,
      { useFindAndModify: true, new: true },
      function (err, docs) {
        if (err) {
          return response.json({ error: true, message: "falhou no mongoose" });
        } else {
          return response.json({
            Message: "Atualizado com sucesso",
            user: docs,
          });
        }
      }
    )
      .clone()
      .catch((error) => {
        return response.json({ error: true, message: "falhou no mongoose" });
      });
  } catch (e) {
    console.error(e);
  }
};

export const getUserById = async (request: Request, response: Response) => {
  try {
    const id = request.params.userId;
    const user = await User.findById(id);
    return response.json(user);
  } catch (error) {
    return response.json({ error: true, message: "ops" });
  }
};

export const me = async (request: any, response: Response) => {
  try {
    const email = request.user;

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return response
        .status(401)
        .json({ error: true, message: "User not found." });
    }

    return response.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      username: user.username,
      thumbnail: user.thumbnail,
      email: user.email,
    });
  } catch (error) {
    return response.status(500).json({ status: "Error!", error });
  }
};

export const login = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    const emailLower = String(email).toLowerCase();

    const user: UserType = await User.findOne({ email: emailLower }).lean();

    if (email.length == 0) {
      return response.json({ status: "Erro!", error: "Qual Ã© o seu email?" });
    }

    if (!user) {
      return response.json({
        status: "Erro!",
        error: "E-mail ou senha invÃ¡lidos",
      });
    }

    if (password.length == 0) {
      return response.json({
        status: "Erro!",
        error: "Qual Ã© a sua password?",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET
      );

      const userData = {
        id: user._id,
        name: user.name,
        username: user.username,
        thumbnail: user.thumbnail,
        email: user.email,
        role: user.role,
        config: user.config,
      };

      const data = { token: token, user: userData };

      return response.json({
        status: "UsuÃ¡rio logado com sucesso!",
        data: data,
      });
    } else {
      return response.json({
        status: "Erro!",
        error: "E-mail ou senha invÃ¡lidos",
      });
    }
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const register = async (request: Request, response: Response) => {
  try {
    const { email, password, name, username, thumbnail } = request.body;

    const role = "member";

    const emailLower = String(email).toLowerCase();

    if (!email || !password) {
      return response.json({
        status: "Erro!",
        error: "Dados invalidos",
      });
    }

    if (email.length === 0) {
      return response.json({
        status: "Erro!",
        error: "VocÃª precisa inserir seu email",
      });
    }

    if (!validator.validate(email)) {
      return response.json({
        status: "Erro!",
        error: "VocÃª precisa inserir um email",
      });
    }

    if (password.length < 8) {
      return response.json({
        status: "Erro!",
        error: "Sua senha deve conter no minimo 8 digitos",
      });
    }

    const e_username = await User.findOne({ username }).lean();
    if (e_username) {
      return response.json({
        status: "Erro!",
        error: "Esse username jÃ¡ foi registrado",
      });
    }

    const e_email = await User.findOne({ email: emailLower }).lean();
    if (e_email) {
      return response.json({
        status: "Erro!",
        error: "Esse email jÃ¡ foi registrado",
      });
    }

    const crypted_password = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      thumbnail,
      role,
      email: emailLower,
      password: crypted_password,
    });
    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      {
        subject: email,
        expiresIn: "30d",
      }
    );

    const userData = {
      id: user._id,
      name: user.name,
      username: user.username,
      thumbnail: user.thumbnail,
      role: user.role,
      email: user.email,
      config: user.config,
    };

    const data = { token: token, user: userData };

    return response.json({ status: "UsuÃ¡rio criado com sucesso!", data });
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const requestResetPassword = async (
  request: Request,
  response: Response
) => {
  try {
    const { email } = request.body;

    const emailLower = String(email).toLowerCase();

    const user = await User.findOne({
      email: emailLower,
    }).lean();

    const userId = user?._id;

    if (!user) return response.json("UsuÃ¡rio nÃ£o encontrado");
    let token = await Token.findOne({ userId });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(10));

    await new Token({
      userId,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `https://app.membros.me/recovery?token=${resetToken}&id=${user._id}`;

    const info = await transporter.sendMail({
      from: "Membros <suporte@membros.me>", // sender address
      to: [emailLower], // list of receivers
      subject: "Redefinir senha", // Subject line
      html: `<p>Clique no link abaixo para redefinir sua senha</p><a href="${link}">${link}</a>`,
    });

    return response.json(
      "VocÃª receberÃ¡ um email com instruÃ§Ãµes para redefinir sua senha."
    );
  } catch (e) {
    return response.status(500).json({ status: "Erro!", error: e });
  }
};

export const resetPassword = async (request: Request, response: Response) => {
  try {
    const { userId, token, password } = request.body;

    let passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      return response.json("Recovery invÃ¡lido ou tempo excedido.");
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return response.json("Recovery invÃ¡lido ou tempo excedido.");
    }
    const hash = await bcrypt.hash(password, Number(10));
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await User.findById(userId).lean();

    const info = await transporter.sendMail({
      from: "Membros <suporte@membros.me>", // sender address
      to: [user?.email], // list of receivers
      subject: "Senha redefinida com sucesso", // Subject line
      html: `<p>OlÃ¡, sua senha foi redefinida com sucesso!</p>`,
    });

    await passwordResetToken.deleteOne();
    return response.json("Senha redefinida com sucesso!");
  } catch (e) {}
};
