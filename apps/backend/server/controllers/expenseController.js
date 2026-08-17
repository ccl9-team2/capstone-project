import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";
import { validateCustomSplits } from "../utils/splitCalculator.js";

/*
 * 🟢 NEW
 * Splits an expense using cents instead of repeatedly
 * rounding the same dollar amount.
 *
 * Example:
 * $80.00 / 3 = $26.67, $26.67, $26.66
 *
 * Total = exactly $80.00
 */
function calculateEqualSplitAmounts(amount, count) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(
      "At least one group member is required to split an expense.",
    );
  }

  const totalCents = Math.round(Number(amount) * 100);

  const baseShareCents = Math.floor(totalCents / count);

  const remainderCents = totalCents % count;

  return Array.from({ length: count }, (_, index) => {
    const shareCents = baseShareCents + (index < remainderCents ? 1 : 0);

    return shareCents / 100;
  });
}

/**
 * GET /api/expenses
 */
export async function getExpenses(req, res, next) {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },

        group: true,

        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        expenseDate: "desc",
      },
    });

    success(res, expenses);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/expenses/:id
 */
export async function getExpenseById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const expense = await prisma.expense.findUnique({
      where: {
        id,
      },

      include: {
        createdBy: true,

        group: true,

        splits: {
          include: {
            user: true,
          },
        },

        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!expense) {
      return failure(res, "Expense not found.", 404);
    }

    success(res, expense);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/expenses
 */
export async function createExpense(req, res, next) {
  try {
    requireFields(req.body, [
      "description",
      "amount",
      "groupId",
      "createdById",
    ]);

    const { description, amount, groupId, createdById, splits } = req.body;

    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          description,

          amount: Number(amount),

          groupId: Number(groupId),

          createdById: Number(createdById),
        },
      });

      /*
       * CUSTOM SPLIT
       */
      if (splits && splits.length > 0) {
        if (!validateCustomSplits(amount, splits)) {
          throw new Error("Split amounts must equal total expense.");
        }

        await tx.expenseSplit.createMany({
          data: splits.map((split) => ({
            expenseId: newExpense.id,

            userId: Number(split.userId),

            amountOwed: Number(split.amount),

            settled: false,
          })),
        });
      } else {
        /*
         * 🟢 CHANGED
         * Get all group members in a
         * consistent order.
         */
        const members = await tx.groupMember.findMany({
          where: {
            groupId: Number(groupId),
          },

          orderBy: {
            id: "asc",
          },
        });

        if (members.length === 0) {
          throw new Error(
            "This group has no members to split the expense between.",
          );
        }

        /*
         * 🟢 CHANGED
         * Calculate an exact amount
         * for EACH member.
         */
        const splitAmounts = calculateEqualSplitAmounts(
          Number(amount),
          members.length,
        );

        await tx.expenseSplit.createMany({
          data: members.map((member, index) => ({
            expenseId: newExpense.id,

            userId: member.userId,

            amountOwed: splitAmounts[index],

            settled: false,
          })),
        });
      }

      return tx.expense.findUnique({
        where: {
          id: newExpense.id,
        },

        include: {
          splits: {
            include: {
              user: true,
            },
          },

          createdBy: true,

          group: true,
        },
      });
    });

    success(res, expense, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/expenses/:id
 */
export async function updateExpense(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.expense.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Expense not found.", 404);
    }

    requireFields(req.body, ["description", "amount"]);

    const updatedExpense = await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id,
        },

        data: {
          description: req.body.description,

          amount: Number(req.body.amount),
        },
      });

      /*
       * 🟢 CHANGED
       * Retrieve the existing splits
       * in a consistent order.
       */
      const splits = await tx.expenseSplit.findMany({
        where: {
          expenseId: id,
        },

        orderBy: {
          id: "asc",
        },
      });

      if (splits.length === 0) {
        throw new Error("This expense has no splits to update.");
      }

      /*
       * 🟢 CHANGED
       * Recalculate the individual
       * shares using cents.
       */
      const splitAmounts = calculateEqualSplitAmounts(
        Number(req.body.amount),
        splits.length,
      );

      for (let index = 0; index < splits.length; index += 1) {
        await tx.expenseSplit.update({
          where: {
            id: splits[index].id,
          },

          data: {
            amountOwed: splitAmounts[index],
          },
        });
      }

      return tx.expense.findUnique({
        where: {
          id,
        },

        include: {
          splits: {
            include: {
              user: true,
            },
          },

          createdBy: true,

          group: true,
        },
      });
    });

    success(res, updatedExpense);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/expenses/:id
 */
export async function deleteExpense(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.expense.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Expense not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.expenseSplit.deleteMany({
        where: {
          expenseId: id,
        },
      });

      await tx.comment.deleteMany({
        where: {
          expenseId: id,
        },
      });

      await tx.expense.delete({
        where: {
          id,
        },
      });
    });

    success(res, {
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
