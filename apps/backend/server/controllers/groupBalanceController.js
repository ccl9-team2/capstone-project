import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";

export async function getGroupBalances(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    if (!groupId || Number.isNaN(groupId)) {
      return failure(res, "Invalid group ID.", 400);
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    const expenses = await prisma.expense.findMany({
      where: {
        groupId,
      },
      include: {
        splits: true,
      },
    });

    const payments = await prisma.payment.findMany({
      where: {
        expenseSplit: {
          expense: {
            groupId,
          },
        },
      },
    });

    const balances = {};

    for (const member of group.members) {
      const userId = member.user.id;

      balances[userId] = {
        userId,
        name: member.user.name,
        email: member.user.email,
        balance: 0,
      };
    }

    /*
     * Expense calculation
     *
     * Whoever paid gets credited with the full
     * expense amount.
     *
     * Each person's split gets deducted from
     * their balance.
     */
    for (const expense of expenses) {
      const payerId = expense.createdBy;

      if (balances[payerId]) {
        balances[payerId].balance += Number(expense.amount);
      }

      for (const split of expense.splits) {
        if (balances[split.userId]) {
          balances[split.userId].balance -= Number(split.amountOwed);
        }
      }
    }

    /*
     * Payments move money from one person to
     * another, so they reduce the payer's
     * balance and increase the receiver's.
     */
    for (const payment of payments) {
      if (balances[payment.fromUserId]) {
        balances[payment.fromUserId].balance += Number(payment.amount);
      }

      if (balances[payment.toUserId]) {
        balances[payment.toUserId].balance -= Number(payment.amount);
      }
    }

    const balanceList = Object.values(balances).map((person) => ({
      ...person,
      balance: Number(person.balance.toFixed(2)),
    }));

    /*
     * Convert net balances into simplified
     * "who owes who" transactions.
     */
    const creditors = balanceList
      .filter((person) => person.balance > 0.01)
      .map((person) => ({
        ...person,
        remaining: person.balance,
      }));

    const debtors = balanceList
      .filter((person) => person.balance < -0.01)
      .map((person) => ({
        ...person,
        remaining: Math.abs(person.balance),
      }));

    const settlements = [];

    for (const debtor of debtors) {
      for (const creditor of creditors) {
        if (debtor.remaining <= 0.01) {
          break;
        }

        if (creditor.remaining <= 0.01) {
          continue;
        }

        const amount = Math.min(debtor.remaining, creditor.remaining);

        settlements.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.name,
          toUserId: creditor.userId,
          toUserName: creditor.name,
          amount: Number(amount.toFixed(2)),
        });

        debtor.remaining -= amount;
        creditor.remaining -= amount;
      }
    }

    const totalSpent = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    success(res, {
      groupId,
      totalSpent: Number(totalSpent.toFixed(2)),
      balances: balanceList,
      settlements,
    });
  } catch (error) {
    next(error);
  }
}
