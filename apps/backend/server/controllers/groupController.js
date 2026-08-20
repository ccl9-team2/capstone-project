import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

async function getGroupAccess(groupId, userId) {
  return prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      createdById: true,
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });
}

function isGroupCreator(group, userId) {
  return Number(group.createdById) === Number(userId);
}

function isGroupMember(group) {
  return group.members.length > 0;
}

/**
 * GET /api/groups
 */
export async function getGroups(req, res, next) {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
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

        // 🟢 NEW
        // Include expenses so GroupCard can show
        // the correct expense count.
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
      },

      orderBy: {
        id: "asc",
      },
    });

    success(res, groups);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups/:id
 */
export async function getGroupById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const group = await prisma.group.findUnique({
      where: {
        id,
      },

      include: {
        createdBy: true,

        members: {
          include: {
            user: true,
          },
        },

        expenses: true,
      },
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    const isMember = group.members.some(
      (member) => Number(member.userId) === Number(req.user.id),
    );

    if (!isMember) {
      return failure(res, "You do not have permission to view this group.", 403);
    }

    success(res, group);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/groups
 */
export async function createGroup(req, res, next) {
  try {
    requireFields(req.body, ["name"]);

    const name = String(req.body.name).trim();
    const createdById = req.user.id;

    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          createdById: Number(createdById),
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,

          userId: Number(createdById),
        },
      });

      return newGroup;
    });

    success(res, group, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/groups/:id
 */
export async function updateGroup(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.group.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Group not found.", 404);
    }

    if (!isGroupCreator(existing, req.user.id)) {
      return failure(res, "Only the group creator can update this group.", 403);
    }

    const updated = await prisma.group.update({
      where: {
        id,
      },

      data: {
        name: req.body.name,
      },
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/groups/:id
 */
export async function deleteGroup(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.group.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Group not found.", 404);
    }

    if (!isGroupCreator(existing, req.user.id)) {
      return failure(res, "Only the group creator can delete this group.", 403);
    }

    const expenseCount = await prisma.expense.count({
      where: {
        groupId: id,
      },
    });

    if (expenseCount > 0) {
      return failure(res, "Cannot delete a group that contains expenses.", 400);
    }

    await prisma.groupMember.deleteMany({
      where: {
        groupId: id,
      },
    });

    await prisma.group.delete({
      where: {
        id,
      },
    });

    success(res, {
      message: "Group deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🟢 GET /api/groups/:id/qr-code
 *
 * Returns a join code for a group.
 * For now we use GROUP-{id} so existing groups
 * do not require a database migration.
 */
export async function getGroupQRCode(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return failure(res, "Invalid group ID.", 400);
    }

    const group = await prisma.group.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    const access = await getGroupAccess(id, req.user.id);

    if (!isGroupMember(access)) {
      return failure(
        res,
        "You do not have permission to access this group code.",
        403,
      );
    }

    const code = `GROUP-${group.id}`;

    success(res, {
      code,
      groupId: group.id,
      groupName: group.name,
      group,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🟢 POST /api/groups/join/:code
 *
 * Adds a user to a group using a join code
 * such as GROUP-4.
 */
export async function joinGroupWithCode(req, res, next) {
  try {
    const code = String(req.params.code || "")
      .trim()
      .toUpperCase();

    const userId = req.user.id;

    const match = code.match(/^GROUP-(\d+)$/);

    if (!match) {
      return failure(
        res,
        "Invalid group code. Group codes should look like GROUP-4.",
        400,
      );
    }

    const groupId = Number(match[1]);

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },

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

        // 🟢 NEW
        // Keep returned group data consistent.
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
      },
    });

    if (!group) {
      return failure(res, "No group was found for that code.", 404);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      return failure(res, "You are already a member of this group.", 400);
    }

    await prisma.groupMember.create({
      data: {
        groupId,
        userId,
      },
    });

    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },

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

        // 🟢 NEW
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
      },
    });

    success(res, updatedGroup, 201);
  } catch (error) {
    next(error);
  }
}
