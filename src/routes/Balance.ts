import "dotenv/config";
import express, { NextFunction, Response } from "express";

const router = express.Router();

import { getCourseBalance } from "../controllers/balance";

router.get("/:courseId", getCourseBalance);

export default router;
