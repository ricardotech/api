import "dotenv/config";
import express from "express";

const router = express.Router();

import {
  create,
  read,
  readByWorkspace,
  readAll,
  update,
  updateThumbnail,
  remove,
  readByInstructor,
  readByMember,
  readMembers,
  readCourseByInstructorId,
  updateGuarantee,
  updateEmailSupport,
  updateCategory,
  updateData,
  readMembersCount,
  readInvoicing,
  updateIndex,
  removeThumbnail,
} from "../controllers/course";
import { checkAuthMiddleware } from "../middlewares";

router.post("/", checkAuthMiddleware, create);
router.get("/:id", read);
router.get("/workspace/:workspaceId", checkAuthMiddleware, readByWorkspace);
router.get(
  "/instructor/:courseId",
  checkAuthMiddleware,
  readCourseByInstructorId
);
router.get("/user/:userId", checkAuthMiddleware, readByInstructor);
router.get("/member/:memberId", checkAuthMiddleware, readByMember);
router.get("/members/:courseId", checkAuthMiddleware, readMembers);
router.get("/members/count/:courseId", checkAuthMiddleware, readMembersCount);
router.get("/", checkAuthMiddleware, readAll);
router.get("/invoicing/:courseId", checkAuthMiddleware, readInvoicing)
router.put("/thumbnail/:id", checkAuthMiddleware, updateThumbnail);
router.put("/index/:courseId", checkAuthMiddleware, updateIndex);
router.put("/guarantee/:id", checkAuthMiddleware, updateGuarantee);
router.put("/emailsupport/:id", checkAuthMiddleware, updateEmailSupport);
router.put("/category/:id", checkAuthMiddleware, updateCategory);
router.put("/data/:id", checkAuthMiddleware, updateData);
router.delete("/:id", checkAuthMiddleware, remove);
router.delete("/thumbnail/:id", checkAuthMiddleware, removeThumbnail);

export default router;
