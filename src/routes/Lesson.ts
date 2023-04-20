import "dotenv/config";
import express from "express";

const router = express.Router();

import {
  create,
  read,
  readByModuleId,
  readAll,
  update,
  remove,
  readLessonsDoneByModuleId,
  createLessonDone,
  removeAllDonesByModuleId,
  removeDoneByLessonId,
} from "../controllers/lesson";

router.post("/", create);
router.post("/done", createLessonDone);
router.get("/:id", read);
router.get("/module/:moduleId", readByModuleId);
router.get("/module/done/:moduleId", readLessonsDoneByModuleId);
router.get("/", readAll);
router.put("/:id", update);
router.delete("/:id", remove);
router.delete("/done/:moduleId", removeAllDonesByModuleId);
router.delete("/done/lesson/:lessonId", removeDoneByLessonId);

export default router;
