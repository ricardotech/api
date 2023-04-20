import "dotenv/config";
import express from "express";

const router = express.Router();

import {
  get,
  intro,
  favoriteCourse,
  isCourseFavorited,
  isUsernameAvailable,
  isEmailAvailable,
  updateIdentityEntity,
  updateIdentityData,
  updateIdentityAddress,
  updateIdentitySelfie,
  updateIdentityIdFront,
  updateIdentityIdBack,
  updateIdentityComplete,
  getIdentityComplete,
} from "../controllers/user";

router.get("/get", get);

router.post("/intro", intro);

router.post("/favorite", favoriteCourse);

router.get("/:userId/favorite/:courseId", isCourseFavorited);

router.post("/username/available", isUsernameAvailable);

router.post("/email/available", isEmailAvailable);

router.put("/identity/entity/:userId/:entity", updateIdentityEntity);

router.put("/identity/data/:userId", updateIdentityData);

router.put("/identity/address/:userId", updateIdentityAddress);

router.put("/identity/selfie/:userId", updateIdentitySelfie);

router.put("/identity/id/front/:userId", updateIdentityIdFront);

router.put("/identity/id/back/:userId", updateIdentityIdBack);

router.put("/identity/complete/:userId", updateIdentityComplete);

router.get("/identity/complete/:userId", getIdentityComplete);

export default router;
