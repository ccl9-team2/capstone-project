import express from "express";

import {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// =========================
// ALL NOTIFICATION ROUTES
// REQUIRE LOGIN
// =========================

router.use(authenticate);

// =========================
// NOTIFICATIONS
// =========================

router.get("/", getNotifications);

router.get("/:id", getNotificationById);

router.post("/", createNotification);

router.patch("/:id/read", markNotificationAsRead);

router.delete("/:id", deleteNotification);

export default router;
