import "dotenv/config";
import express from "express";

const router = express.Router();

import {
  create,
  read,
  readByCourseId,
  readAll,
  update,
  remove,
  updateData,
} from "../controllers/module";

router.post("/", create);
router.get("/:id", read);
router.get("/course/:courseId", readByCourseId);
router.get("/", readAll);
router.put("/data/:id", updateData);
router.delete("/:id", remove);

export default router;
