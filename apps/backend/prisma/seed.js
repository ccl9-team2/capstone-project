import "dotenv/config";
import prisma from "../server/db/prisma.js";

async function main() {
  console.log("🌱 Seeding database...");

  // Delete child tables first
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // ------------------------
  // USERS
  // ------------------------

  const michelle = await prisma.user.create({
    data: {
      name: "Michelle",
      email: "michelle@example.com",
      password: "password123",
    },
  });

  const dennis = await prisma.user.create({
    data: {
      name: "Dennis",
      email: "dennis@example.com",
      password: "password123",
    },
  });

  const jerusalem = await prisma.user.create({
    data: {
      name: "Jerusalem",
      email: "jerusalem@example.com",
      password: "password123",
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex",
      email: "alex@example.com",
      password: "password123",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah",
      email: "sarah@example.com",
      password: "password123",
    },
  });

  // ------------------------
  // FRIENDSHIPS
  // ------------------------

  await prisma.friendship.createMany({
    data: [
      {
        senderId: michelle.id,
        receiverId: dennis.id,
        status: "accepted",
      },
      {
        senderId: michelle.id,
        receiverId: jerusalem.id,
        status: "accepted",
      },
      {
        senderId: alex.id,
        receiverId: sarah.id,
        status: "accepted",
      },
    ],
  });

  // ------------------------
  // GROUPS
  // ------------------------

  const capstone = await prisma.group.create({
    data: {
      name: "Capstone Project",
      createdById: michelle.id,
    },
  });

  const weekendTrip = await prisma.group.create({
    data: {
      name: "Weekend Trip",
      createdById: alex.id,
    },
  });

  // ------------------------
  // GROUP MEMBERS
  // ------------------------

  await prisma.groupMember.createMany({
    data: [
      { groupId: capstone.id, userId: michelle.id },
      { groupId: capstone.id, userId: dennis.id },
      { groupId: capstone.id, userId: jerusalem.id },

      { groupId: weekendTrip.id, userId: michelle.id },
      { groupId: weekendTrip.id, userId: alex.id },
      { groupId: weekendTrip.id, userId: sarah.id },
    ],
  });

  // ------------------------
  // EXPENSES
  // ------------------------

  const pizza = await prisma.expense.create({
    data: {
      description: "Team Pizza",
      amount: 54,
      groupId: capstone.id,
      createdById: dennis.id,
    },
  });

  const domain = await prisma.expense.create({
    data: {
      description: "Domain Name",
      amount: 18,
      groupId: capstone.id,
      createdById: michelle.id,
    },
  });

  const airbnb = await prisma.expense.create({
    data: {
      description: "Airbnb",
      amount: 450,
      groupId: weekendTrip.id,
      createdById: alex.id,
    },
  });

  const gas = await prisma.expense.create({
    data: {
      description: "Gas",
      amount: 75,
      groupId: weekendTrip.id,
      createdById: sarah.id,
    },
  });

  // ------------------------
  // EXPENSE SPLITS
  // ------------------------

  const pizzaSplits = await Promise.all([
    prisma.expenseSplit.create({
      data: {
        expenseId: pizza.id,
        userId: michelle.id,
        amountOwed: 18,
      },
    }),
    prisma.expenseSplit.create({
      data: {
        expenseId: pizza.id,
        userId: dennis.id,
        amountOwed: 18,
      },
    }),
    prisma.expenseSplit.create({
      data: {
        expenseId: pizza.id,
        userId: jerusalem.id,
        amountOwed: 18,
      },
    }),
  ]);

  // Domain
  await prisma.expenseSplit.createMany({
    data: [
      {
        expenseId: domain.id,
        userId: michelle.id,
        amountOwed: 6,
      },
      {
        expenseId: domain.id,
        userId: dennis.id,
        amountOwed: 6,
      },
      {
        expenseId: domain.id,
        userId: jerusalem.id,
        amountOwed: 6,
      },
    ],
  });

  // Airbnb
  await prisma.expenseSplit.createMany({
    data: [
      {
        expenseId: airbnb.id,
        userId: michelle.id,
        amountOwed: 150,
      },
      {
        expenseId: airbnb.id,
        userId: alex.id,
        amountOwed: 150,
      },
      {
        expenseId: airbnb.id,
        userId: sarah.id,
        amountOwed: 150,
      },
    ],
  });

  // Gas
  await prisma.expenseSplit.createMany({
    data: [
      {
        expenseId: gas.id,
        userId: michelle.id,
        amountOwed: 25,
      },
      {
        expenseId: gas.id,
        userId: alex.id,
        amountOwed: 25,
      },
      {
        expenseId: gas.id,
        userId: sarah.id,
        amountOwed: 25,
      },
    ],
  });

  // ------------------------
  // PAYMENT
  // ------------------------

  await prisma.payment.create({
    data: {
      expenseSplitId: pizzaSplits[0].id,
      fromUserId: michelle.id,
      toUserId: dennis.id,
      amount: 18,
    },
  });

  // ------------------------
  // COMMENTS
  // ------------------------

  await prisma.comment.createMany({
    data: [
      {
        expenseId: pizza.id,
        userId: michelle.id,
        text: "Thanks for grabbing dinner!",
      },
      {
        expenseId: airbnb.id,
        userId: sarah.id,
        text: "Can't wait for the trip!",
      },
    ],
  });

  // ------------------------
  // NOTIFICATIONS
  // ------------------------

  await prisma.notification.createMany({
    data: [
      {
        userId: dennis.id,
        message: "Michelle paid you $18.",
        isRead: false,
      },
      {
        userId: michelle.id,
        message: "Dennis added a new expense.",
        isRead: true,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
