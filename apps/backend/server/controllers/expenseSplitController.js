import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";

/**
 * GET /api/expense-splits
 */
export async function getExpenseSplits(req, res, next) {
  try {
    const expenseSplits = await prisma.expenseSplit.findMany({
      include: {
        expense: {
          select: {
            id: true,
            description: true,
            amount: true,
            groupId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: true
      },
      orderBy: {
        id: "asc"
      }
    });

    success(res, expenseSplits);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/expense-splits/:id
 */
export async function getExpenseSplitById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const expenseSplit = await prisma.expenseSplit.findUnique({
      where: { id },
      include: {
        expense: {
          include: {
            group: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true
              }
            },
            toUser: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!expenseSplit) {
      return failure(res, "Expense split not found.", 404);
    }

    success(res, expenseSplit);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/expense-splits/:id
 *
 * Used primarily to update the settled status.
 */
export async function updateExpenseSplit(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.expenseSplit.findUnique({
      where: { id }
    });

    if (!existing) {
      return failure(res, "Expense split not found.", 404);
    }

    const data = {};

    if (req.body.settled !== undefined) {
      data.settled = Boolean(req.body.settled);
    }

    if (req.body.amountOwed !== undefined) {
      data.amountOwed = Number(req.body.amountOwed);
    }

    const updated = await prisma.expenseSplit.update({
      where: { id },
      data,
      include: {
        expense: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}