import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

/**
 * GET /api/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const { userId, isRead } = req.query;

    const where = {
      ...(userId ? { userId: Number(userId) } : {}),
      ...(isRead !== undefined ? { isRead: isRead === "true" } : {}),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    success(res, notifications);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notifications/:id
 */
export async function getNotificationById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return failure(res, "Notification not found.", 404);
    }

    success(res, notification);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/notifications
 */
export async function createNotification(req, res, next) {
  try {
    requireFields(req.body, ["userId", "message"]);

    const notification = await prisma.notification.create({
      data: {
        userId: Number(req.body.userId),
        message: req.body.message,
        isRead: false,
      },
    });

    success(res, notification, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 */
export async function markNotificationAsRead(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.notification.findUnique({ where: { id } });

    if (!existing) {
      return failure(res, "Notification not found.", 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.notification.findUnique({ where: { id } });

    if (!existing) {
      return failure(res, "Notification not found.", 404);
    }

    await prisma.notification.delete({ where: { id } });

    success(res, { message: "Notification deleted successfully." });
  } catch (error) {
    next(error);
  }
}
