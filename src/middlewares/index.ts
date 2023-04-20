import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = String(process.env.JWT_SECRET);

export const checkAuthMiddleware = async (
  request: any,
  response: Response,
  next: NextFunction
) => {
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
    request.userId = decoded._id;

    return next();
  } catch (error) {
    return response.status(403).json({
      error: true,
      code: "token.invalid",
      message: "Token invalid.",
    });
  }
};
