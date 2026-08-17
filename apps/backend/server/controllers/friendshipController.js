import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

const FRIENDSHIP_STATUSES = ["Pending", "Accepted", "Rejected", "Blocked"];

/**
 * GET /api/friendships
 */
export async function getFriendships(req, res, next) {
  try {
    const { status } = req.query;

    const friendships = await prisma.friendship.findMany({
      where: status
        ? {
            status,
          }
        : undefined,

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    success(res, friendships);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/friendships/:id
 */
export async function getFriendshipById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const friendship = await prisma.friendship.findUnique({
      where: {
        id,
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!friendship) {
      return failure(res, "Friendship not found.", 404);
    }

    success(res, friendship);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/friendships
 *
 * Creates a new friend request.
 *
 * 🟢 CHANGED:
 * The notification now includes
 * the sender's name.
 */
export async function createFriendship(req, res, next) {
  try {
    requireFields(req.body, ["senderId", "receiverId"]);

    const senderId = Number(req.body.senderId);

    const receiverId = Number(req.body.receiverId);

    if (!Number.isInteger(senderId) || !Number.isInteger(receiverId)) {
      return failure(res, "Invalid sender or receiver ID.", 400);
    }

    if (senderId === receiverId) {
      return failure(res, "Cannot send a friend request to yourself.", 400);
    }

    // =========================
    // 🟢 GET BOTH USERS
    // =========================

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: senderId,
        },

        select: {
          id: true,
          name: true,
          email: true,
        },
      }),

      prisma.user.findUnique({
        where: {
          id: receiverId,
        },

        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

    if (!sender) {
      return failure(res, "Sender not found.", 404);
    }

    if (!receiver) {
      return failure(res, "Receiver not found.", 404);
    }

    // =========================
    // CHECK EXISTING
    // =========================

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },

          {
            senderId: receiverId,

            receiverId: senderId,
          },
        ],
      },
    });

    if (existing) {
      return failure(res, "Friendship already exists.", 409);
    }

    // =========================
    // CREATE REQUEST +
    // NOTIFICATION
    // =========================

    const friendship = await prisma.$transaction(async (tx) => {
      const newFriendship = await tx.friendship.create({
        data: {
          senderId,
          receiverId,
          status: "Pending",
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // 🟢 CHANGED
      await tx.notification.create({
        data: {
          userId: receiverId,

          message: `${sender.name} sent you a friend request.`,

          isRead: false,
        },
      });

      return newFriendship;
    });

    success(res, friendship, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/friendships/:id
 *
 * Updates a friendship request.
 *
 * 🟢 CHANGED:
 * Acceptance notifications now
 * include the receiver's name.
 */
export async function updateFriendship(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.friendship.findUnique({
      where: {
        id,
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existing) {
      return failure(res, "Friendship not found.", 404);
    }

    requireFields(req.body, ["status"]);

    const { status } = req.body;

    if (!FRIENDSHIP_STATUSES.includes(status)) {
      return failure(
        res,
        `Invalid status. Must be one of: ${FRIENDSHIP_STATUSES.join(", ")}`,
        400,
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedFriendship = await tx.friendship.update({
        where: {
          id,
        },

        data: {
          status,
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // =========================
      // 🟢 ACCEPTED
      // =========================

      if (status === "Accepted") {
        await tx.notification.create({
          data: {
            userId: existing.senderId,

            message: `${existing.receiver.name} accepted your friend request.`,

            isRead: false,
          },
        });
      }

      // =========================
      // 🟢 REJECTED
      // =========================

      if (status === "Rejected") {
        await tx.notification.create({
          data: {
            userId: existing.senderId,

            message: `${existing.receiver.name} declined your friend request.`,

            isRead: false,
          },
        });
      }

      return updatedFriendship;
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/friendships/:id
 */
export async function deleteFriendship(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.friendship.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Friendship not found.", 404);
    }

    await prisma.friendship.delete({
      where: {
        id,
      },
    });

    success(res, {
      message: "Friendship removed successfully.",
    });
  } catch (error) {
    next(error);
  }
}
