import prisma from "../db/prisma.js";
import { success } from "../utils/apiResponse.js";

export async function getStats(req, res, next) {
  try {
    const expenseStats = await prisma.expense.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      },
      _max: {
        amount: true,
      },
      _min: {
        amount: true,
      },
    });

    const settledSplits = await prisma.expenseSplit.count({
      where: {
        settled: true,
      },
    });

    const unsettledSplits = await prisma.expenseSplit.count({
      where: {
        settled: false,
      },
    });

    const totalUsers = await prisma.user.count();

    const totalGroups = await prisma.group.count();

    const totalExpenses = await prisma.expense.count();

    const totalPayments = await prisma.payment.count();

    success(res, {
      users: totalUsers,

      groups: totalGroups,

      expenses: {
        count: expenseStats._count.id,
        total: expenseStats._sum.amount || 0,
        average: expenseStats._avg.amount || 0,
        largest: expenseStats._max.amount || 0,
        smallest: expenseStats._min.amount || 0,
      },

      payments: totalPayments,

      expenseSplits: {
        settled: settledSplits,
        unsettled: unsettledSplits,
      },
    });
  } catch (error) {
    next(error);
  }
}
