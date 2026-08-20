import express from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBalances,
} from "../controllers/userController.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// =========================
// ALL USER ROUTES REQUIRE LOGIN
// =========================

router.use(authenticate);

// Used for finding users/friends.
// Password is never returned.
router.get("/", getUsers);

// IMPORTANT:
// /:id/balances must come before /:id
router.get("/:id/balances", getUserBalances);

router.get("/:id", getUserById);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
