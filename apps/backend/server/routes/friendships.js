import express from "express";
import {
  getFriendships,
  getFriendshipById,
  createFriendship,
  updateFriendship,
  deleteFriendship,
} from "../controllers/friendshipController.js";

const router = express.Router();

router.get("/", getFriendships);
router.get("/:id", getFriendshipById);
router.post("/", createFriendship);
router.put("/:id", updateFriendship);
router.delete("/:id", deleteFriendship);

export default router;
