import bcrypt from "bcryptjs";

import prisma from "../db/prisma.js";

import { success, failure } from "../utils/apiResponse.js";

import { requireFields } from "../utils/validators.js";

/**
 * GET /api/users
 */
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

/**
 * GET /api/users/:id
 */
export async function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);

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

/**
 * POST /api/users
 */
export async function createUser(req, res, next) {
  try {
    requireFields(req.body, ["name", "email", "password"]);

    const name = String(req.body.name).trim();

    const email = String(req.body.email).trim().toLowerCase();

    const password = String(req.body.password);

    if (password.length < 6) {
      return failure(res, "Password must be at least 6 characters.", 400);
    }

    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return failure(res, "Email already exists.", 409);
    }

    // 🟢 CHANGED
    // Never store a new password as plain text.
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,

        password: hashedPassword,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    success(res, user, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/:id
 */
export async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "User not found.", 404);
    }

    const updated = await prisma.user.update({
      where: {
        id,
      },

      data: {
        name: req.body.name,

        email: req.body.email
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

/**
 * DELETE /api/users/:id
 */
export async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);

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

/**
 * GET /api/users/:id/balances
 *
 * Returns how much a user owes others,
 * and how much others owe them.
 */
export async function getUserBalances(req, res, next) {
  try {
    const userId = Number(req.params.id);

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
