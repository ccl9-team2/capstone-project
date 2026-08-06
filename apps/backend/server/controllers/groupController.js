import prisma from "../db/prisma.js";

export async function getGroups(req, res, next) {
  try {
    const groups = await prisma.group.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      orderBy: {
        id: "asc",
      },
    });

    res.json(groups);
  } catch (error) {
    next(error);
  }
}

export async function createGroup(req, res, next) {
  try {
    const { name, createdById } = req.body;

    if (!name || !createdById) {
      return res.status(400).json({
        message: "Group name and creator are required.",
      });
    }

    const group = await prisma.group.create({
      data: {
        name,
        createdById,
      },
    });

    // Automatically add the creator as a member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: createdById,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}
