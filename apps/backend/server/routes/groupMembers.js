import express from "express";

import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
} from "../controllers/groupMemberController.js";

const router = express.Router();

router.get("/:groupId/members", getGroupMembers);

router.post("/:groupId/members", addGroupMember);

router.delete("/:groupId/members/:userId", removeGroupMember);

export default router;
