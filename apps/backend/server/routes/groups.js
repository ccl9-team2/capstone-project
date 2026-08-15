import express from "express";

import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,

  // 🟢 NEW
  getGroupQRCode,
  joinGroupWithCode,
} from "../controllers/groupController.js";

const router = express.Router();

router.get("/", getGroups);

// 🟢 NEW
router.get("/:id/qr-code", getGroupQRCode);

router.get("/:id", getGroupById);

router.post("/", createGroup);

// 🟢 NEW
router.post("/join/:code", joinGroupWithCode);

router.put("/:id", updateGroup);

router.delete("/:id", deleteGroup);

export default router;
