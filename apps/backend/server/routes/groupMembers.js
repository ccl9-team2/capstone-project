import express from "express";
import authenticate from "../middleware/authenticate.js";

import {
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
} from "../controllers/groupMemberController.js";

const router = express.Router();

router.use(authenticate);

router.get("/:groupId/members", getGroupMembers);

router.post("/:groupId/members", addGroupMember);

router.delete("/:groupId/members/:userId", removeGroupMember);

export default router;
