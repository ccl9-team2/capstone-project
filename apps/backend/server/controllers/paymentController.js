import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

/**
 * GET /api/payments
 */
export async function getPayments(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        expenseSplit: {
          include: {
            expense: {
              select: {
                id: true,
                description: true,
                amount: true
              }
            }
          }
        },
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        paymentDate: "desc"
      }
    });

    success(res, payments);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/:id
 */
export async function getPaymentById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        expenseSplit: {
          include: {
            expense: true
          }
        },
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return failure(res, "Payment not found.", 404);
    }

    success(res, payment);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments
 *
 * Creates a payment and marks the associated
 * expense split as settled.
 */
export async function createPayment(req, res, next) {
  try {
    requireFields(req.body, [
      "expenseSplitId",
      "fromUserId",
      "toUserId",
      "amount"
    ]);

    const {
      expenseSplitId,
      fromUserId,
      toUserId,
      amount
    } = req.body;

    const payment = await prisma.$transaction(async (tx) => {
      // Find the expense split
      const expenseSplit = await tx.expenseSplit.findUnique({
        where: {
          id: Number(expenseSplitId)
        },
        include: {
          expense: true
        }
      });

      if (!expenseSplit) {
        throw new Error("Expense split not found.");
      }

      // Make sure the split hasn't already been settled
      if (expenseSplit.settled) {
        throw new Error("This expense split has already been settled.");
      }

      // Make sure the payment amount matches the amount owed
      if (
        Math.abs(
          Number(amount) - Number(expenseSplit.amountOwed)
        ) > 0.01
      ) {
        throw new Error(
          "Payment amount must match the amount owed."
        );
      }

      // Create payment
      const newPayment = await tx.payment.create({
        data: {
          expenseSplitId: Number(expenseSplitId),
          fromUserId: Number(fromUserId),
          toUserId: Number(toUserId),
          amount: Number(amount)
        }
      });

      // Mark the split as settled
      await tx.expenseSplit.update({
        where: {
          id: Number(expenseSplitId)
        },
        data: {
          settled: true
        }
      });

      // Return payment with related information
      return tx.payment.findUnique({
        where: {
          id: newPayment.id
        },
        include: {
          expenseSplit: {
            include: {
              expense: true
            }
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          toUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    success(res, payment, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/payments/:id
 */
export async function updatePayment(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      return failure(res, "Payment not found.", 404);
    }

    requireFields(req.body, [
      "fromUserId",
      "toUserId",
      "amount"
    ]);

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        fromUserId: Number(req.body.fromUserId),
        toUserId: Number(req.body.toUserId),
        amount: Number(req.body.amount)
      },
      include: {
        expenseSplit: {
          include: {
            expense: true
          }
        },
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    success(res, updatedPayment);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/payments/:id
 *
 * Deletes the payment and reopens the associated
 * expense split.
 */
export async function deletePayment(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existing) {
      return failure(res, "Payment not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      // Delete payment
      await tx.payment.delete({
        where: { id }
      });

      // Mark the associated split as unsettled again
      await tx.expenseSplit.update({
        where: {
          id: existing.expenseSplitId
        },
        data: {
          settled: false
        }
      });
    });

    success(res, {
      message: "Payment deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}