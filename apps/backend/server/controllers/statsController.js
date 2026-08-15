import prisma from "../db/prisma.js";
import { success } from "../utils/apiResponse.js";

export async function getStats(req, res, next) {
  try {
    // 🟢 TEMPORARY current user until authentication/login is added
    const currentUserId = 3;

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

    // 🟢 NEW - total amount paid by current user
    const paidByCurrentUser = await prisma.expense.aggregate({
      where: {
        createdById: currentUserId,
      },
      _sum: {
        amount: true,
      },
    });

    // 🟢 NEW - number of accepted friends for current user
    const friendCount = await prisma.friendship.count({
      where: {
        status: "Accepted",
        OR: [
          {
            senderId: currentUserId,
          },
          {
            receiverId: currentUserId,
          },
        ],
      },
    });

    success(res, {
      users: totalUsers,

      groups: totalGroups,

      // 🟢 NEW
      friends: friendCount,

      expenses: {
        count: expenseStats._count.id,
        total: expenseStats._sum.amount || 0,
        average: expenseStats._avg.amount || 0,
        largest: expenseStats._max.amount || 0,
        smallest: expenseStats._min.amount || 0,
      },

      payments: totalPayments,

      // 🟢 NEW
      totalPaid: paidByCurrentUser._sum.amount || 0,

      expenseSplits: {
        settled: settledSplits,
        unsettled: unsettledSplits,
      },
    });
  } catch (error) {
    next(error);
  }
}
