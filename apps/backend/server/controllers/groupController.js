import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

/**
 * GET /api/groups
 */
export async function getGroups(req, res, next) {
  try {
    const groups = await prisma.group.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        id: "asc"
      }
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
      where: { id },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true
          }
        },
        expenses: true
      }
    });

    if (!group) {
      return failure(res, "Group not found.", 404);
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
    requireFields(req.body, ["name", "createdById"]);

    const { name, createdById } = req.body;

    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          createdById: Number(createdById)
        }
      });

      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: Number(createdById)
        }
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
      where: { id }
    });

    if (!existing) {
      return failure(res, "Group not found.", 404);
    }

    const updated = await prisma.group.update({
      where: { id },
      data: {
        name: req.body.name
      }
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
      where: { id }
    });

    if (!existing) {
      return failure(res, "Group not found.", 404);
    }

    const expenseCount = await prisma.expense.count({
      where: {
        groupId: id
      }
    });

    if (expenseCount > 0) {
      return failure(
        res,
        "Cannot delete a group that contains expenses.",
        400
      );
    }

    await prisma.groupMember.deleteMany({
      where: {
        groupId: id
      }
    });

    await prisma.group.delete({
      where: {
        id
      }
    });

    success(res, {
      message: "Group deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}