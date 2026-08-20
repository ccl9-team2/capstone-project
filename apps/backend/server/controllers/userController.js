import prisma from "../db/prisma.js";

import { success, failure } from "../utils/apiResponse.js";

// =========================
// AUTHORIZATION HELPER
// =========================

function isOwnUser(req, requestedUserId) {
  return Number(req.user?.id) === Number(requestedUserId);
}

// =========================
// GET /api/users
// =========================

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },

      orderBy: {
        id: "asc",
      },
    });

    success(res, users);
  } catch (error) {
    next(error);
  }
}

// =========================
// GET /api/users/:id
// =========================

export async function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return failure(res, "Invalid user ID.", 400);
    }

    // 🟢 USER PERMISSION
    if (!isOwnUser(req, id)) {
      return failure(
        res,
        "You do not have permission to view this user account.",
        403,
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    success(res, user);
  } catch (error) {
    next(error);
  }
}

// =========================
// PUT /api/users/:id
// =========================

export async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return failure(res, "Invalid user ID.", 400);
    }

    // 🟢 USER PERMISSION
    if (!isOwnUser(req, id)) {
      return failure(res, "You cannot modify another user's account.", 403);
    }

    const existing = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "User not found.", 404);
    }

    // 🟢 PREVENT DUPLICATE EMAIL
    if (req.body.email) {
      const normalizedEmail = String(req.body.email).trim().toLowerCase();

      const emailOwner = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (emailOwner && Number(emailOwner.id) !== id) {
        return failure(res, "That email address is already in use.", 409);
      }
    }

    const updated = await prisma.user.update({
      where: {
        id,
      },

      data: {
        name:
          req.body.name !== undefined
            ? String(req.body.name).trim()
            : undefined,

        email:
          req.body.email !== undefined
            ? String(req.body.email).trim().toLowerCase()
            : undefined,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}

// =========================
// DELETE /api/users/:id
// =========================

export async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return failure(res, "Invalid user ID.", 400);
    }

    // 🟢 USER PERMISSION
    if (!isOwnUser(req, id)) {
      return failure(res, "You cannot delete another user's account.", 403);
    }

    const existing = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "User not found.", 404);
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    success(res, {
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// =========================
// GET /api/users/:id/balances
// =========================

export async function getUserBalances(req, res, next) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return failure(res, "Invalid user ID.", 400);
    }

    // 🟢 USER PERMISSION
    // A user may only retrieve their
    // own personal balance summary.
    if (!isOwnUser(req, userId)) {
      return failure(res, "You cannot view another user's balances.", 403);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    // =========================
    // MONEY THIS USER OWES
    // =========================

    const owedByUser = await prisma.expenseSplit.findMany({
      where: {
        userId,

        settled: false,

        expense: {
          createdById: {
            not: userId,
          },
        },
      },

      include: {
        expense: {
          select: {
            id: true,
            description: true,

            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // =========================
    // MONEY OWED TO THIS USER
    // =========================

    const owedToUser = await prisma.expenseSplit.findMany({
      where: {
        settled: false,

        userId: {
          not: userId,
        },

        expense: {
          createdById: userId,
        },
      },

      include: {
        expense: {
          select: {
            id: true,
            description: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalYouOwe = owedByUser.reduce(
      (sum, split) => sum + Number(split.amountOwed),
      0,
    );

    const totalYouAreOwed = owedToUser.reduce(
      (sum, split) => sum + Number(split.amountOwed),
      0,
    );

    success(res, {
      user,

      totalYouOwe,

      totalYouAreOwed,

      netBalance: totalYouAreOwed - totalYouOwe,

      youOwe: owedByUser.map((split) => ({
        splitId: split.id,

        expenseId: split.expense.id,

        description: split.expense.description,

        owedTo: split.expense.createdBy,

        amount: Number(split.amountOwed),
      })),

      owedToYou: owedToUser.map((split) => ({
        splitId: split.id,

        expenseId: split.expense.id,

        description: split.expense.description,

        owedBy: split.user,

        amount: Number(split.amountOwed),
      })),
    });
  } catch (error) {
    next(error);
  }
}
