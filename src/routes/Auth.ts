import "dotenv/config";
import express, { NextFunction, Response } from "express";

const router = express.Router();

import jwt from "jsonwebtoken";

const JWT_SECRET = String(process.env.JWT_SECRET);

import {
  getUserById,
  login,
  me,
  register,
  requestResetPassword,
  resetPassword,
  sessions,
  update,
} from "../controllers/auth";

function checkAuthMiddleware(
  request: any,
  response: Response,
  next: NextFunction
) {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present.",
    });
  }

  const [, token] = authorization?.split(" ");

  if (!token) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present.",
    });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    request.user = decoded.email;

    return next();
  } catch (error) {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return response.status(401).json({
      error: decoded.email,
      code: "token.expired",
      message: "Token invalid.",
    });
  }
}

router.post("/sessions", sessions);

router.get("/me", checkAuthMiddleware, me);

router.get("/user/:userId", getUserById);

router.post("/signup", register);

router.post("/signin", login);

router.post("/requestResetPassword", requestResetPassword);

router.post("/resetPassword", resetPassword);

export default router;
