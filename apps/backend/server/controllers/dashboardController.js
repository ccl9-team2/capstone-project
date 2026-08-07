import prisma from "../db/prisma.js";
import { success } from "../utils/apiResponse.js";

export async function getDashboard(req, res, next) {
  try {
    const [
      totalUsers,
      totalGroups,
      totalExpenses,
      totalPayments,
      totalComments,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.group.count(),

      prisma.expense.count(),

      prisma.payment.count(),

      prisma.comment.count(),
    ]);

    const expenseTotals = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    const paymentTotals = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    const outstanding = await prisma.expenseSplit.aggregate({
      _sum: {
        amountOwed: true,
      },
      where: {
        settled: false,
      },
    });

    success(res, {
      totalUsers,
      totalGroups,
      totalExpenses,
      totalPayments,
      totalComments,

      totalSpent: expenseTotals._sum.amount || 0,

      totalPaid: paymentTotals._sum.amount || 0,

      outstandingAmount: outstanding._sum.amountOwed || 0,
    });
  } catch (error) {
    next(error);
  }
}
