import express from "express";

const router = express.Router();

import {
  create,
  readByCourse,
  readByExists,
  readByUser,
  remove,
} from "../controllers/subscription";
import { checkAuthMiddleware } from "../middlewares";

router.post("/", create);
router.get("/:courseId", checkAuthMiddleware, readByCourse);
router.get("/:userId", checkAuthMiddleware, readByUser);
router.get("/exists/:courseId", checkAuthMiddleware, readByExists);
router.delete("/:id", checkAuthMiddleware, remove);

export default router;
