import prisma from "../db/prisma.js";

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
        comments: {
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

    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/expenses
 */
export async function createExpense(req, res, next) {
  try {
    const { description, amount, groupId, createdById, splits } = req.body;

    // Validate required fields
    if (!description || !amount || !groupId || !createdById) {
      return res.status(400).json({
        message: "Description, amount, groupId, and createdById are required.",
      });
    }

    const expense = await prisma.$transaction(async (tx) => {
      // Make sure the group exists
      const group = await tx.group.findUnique({
        where: {
          id: Number(groupId),
        },
      });

      if (!group) {
        throw new Error("Group not found.");
      }

      // Create the expense
      const newExpense = await tx.expense.create({
        data: {
          description,
          amount: Number(amount),
          groupId: Number(groupId),
          createdById: Number(createdById),
        },
      });

      // -------------------------
      // CUSTOM SPLITS
      // -------------------------

      if (splits && splits.length > 0) {
        const total = splits.reduce(
          (sum, split) => sum + Number(split.amount),
          0,
        );

        if (Math.abs(total - Number(amount)) > 0.01) {
          throw new Error("Split amounts must equal the total expense.");
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
        // -------------------------
        // EQUAL SPLIT
        // -------------------------

        const members = await tx.groupMember.findMany({
          where: {
            groupId: Number(groupId),
          },
        });

        if (members.length === 0) {
          throw new Error("This group has no members.");
        }

        const share = Number((Number(amount) / members.length).toFixed(2));

        await tx.expenseSplit.createMany({
          data: members.map((member) => ({
            expenseId: newExpense.id,
            userId: member.userId,
            amountOwed: share,
            settled: false,
          })),
        });
      }

      // Return the complete expense
      return await tx.expense.findUnique({
        where: {
          id: newExpense.id,
        },
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
      });
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
}
