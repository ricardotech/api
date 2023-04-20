import "dotenv/config";
import express from "express";

const router = express.Router();

import {
  addCoProductor,
  getCoProductions,
  getCoProductorsByCourseId,
  removeCoProductor,
} from "../controllers/coproductor";

router.post("/:courseId", addCoProductor);
router.get("/", getCoProductions);
router.get("/:courseId", getCoProductorsByCourseId);
router.delete("/:courseId/:userEmail", removeCoProductor);

export default router;
