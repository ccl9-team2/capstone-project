import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";
import {
  calculateEqualSplit,
  validateCustomSplits,
} from "../utils/splitCalculator.js";

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
      where: { id },
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

      if (splits && splits.length > 0) {
        if (!validateCustomSplits(amount, splits)) {
          throw new Error("Split amounts must equal total expense.");
        }

        await tx.expenseSplit.createMany({
          data: splits.map((split) => ({
            expenseId: newExpense.id,
            userId: split.userId,
            amountOwed: split.amount,
            settled: false,
          })),
        });
      } else {
        const members = await tx.groupMember.findMany({
          where: {
            groupId: Number(groupId),
          },
        });

        const share = calculateEqualSplit(Number(amount), members.length);

        await tx.expenseSplit.createMany({
          data: members.map((member) => ({
            expenseId: newExpense.id,
            userId: member.userId,
            amountOwed: share,
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
      where: { id },
    });

    if (!existing) {
      return failure(res, "Expense not found.", 404);
    }

    requireFields(req.body, ["description", "amount"]);

    const updatedExpense = await prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: {
          description: req.body.description,
          amount: Number(req.body.amount),
        },
      });

      const splits = await tx.expenseSplit.findMany({
        where: {
          expenseId: id,
        },
      });

      const share = calculateEqualSplit(Number(req.body.amount), splits.length);

      for (const split of splits) {
        await tx.expenseSplit.update({
          where: {
            id: split.id,
          },
          data: {
            amountOwed: share,
          },
        });
      }

      return updated;
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
      where: { id },
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
