import { checkAuthMiddleware } from './../middlewares/index';
import "dotenv/config";
import express from "express";

const router = express.Router();

import { create, getBillsByCourseId } from "../controllers/bill";

router.post("/", create);
router.get("/:courseId", checkAuthMiddleware, getBillsByCourseId);

export default router;
