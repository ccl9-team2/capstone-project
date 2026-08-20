import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

async function findGroupWithRequester(groupId, userId) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });
}

function isCreator(group, userId) {
  return Number(group.createdById) === Number(userId);
}

/**
 * GET /api/groups/:groupId/members
 */
export async function getGroupMembers(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    const group = await findGroupWithRequester(groupId, req.user.id);

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    if (group.members.length === 0) {
      return failure(res, "You do not have permission to view these members.", 403);
    }

    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    success(res, members);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/groups/:groupId/members
 */
export async function addGroupMember(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    requireFields(req.body, ["userId"]);

    const userId = Number(req.body.userId);

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    if (!isCreator(group, req.user.id)) {
      return failure(res, "Only the group creator can add members.", 403);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
      return failure(res, "User is already a member of this group.", 400);
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    success(res, member, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/groups/:groupId/members/:userId
 */
export async function removeGroupMember(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    const userId = Number(req.params.userId);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
    }

    if (!isCreator(group, req.user.id)) {
      return failure(res, "Only the group creator can remove members.", 403);
    }

    if (Number(group.createdById) === userId) {
      return failure(res, "The group creator cannot be removed.", 400);
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member) {
      return failure(res, "Group member not found.", 404);
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    success(res, {
      message: "Group member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
}
