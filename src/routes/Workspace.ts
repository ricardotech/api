import "dotenv/config";
import express from "express";

const router = express.Router();

import { create, invite, getInvite, read, readByUserId, remove, readMembers } from "../controllers/workspace";

router.post("/", create);
router.post("/invite", invite);
router.get("/invite/:workspaceId/:token", getInvite);
router.get("/", readByUserId);
router.get("/members/:workspaceId", readMembers);
// join for public workspaces (maxAmountMembers)
router.get("/:id", read);
router.delete("/:id", remove);

export default router;
