import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

/**
 * GET /api/comments
 *
 * Optional:
 * GET /api/comments?expenseId=1
 */
export async function getComments(req, res, next) {
  try {
    const expenseId = req.query.expenseId ? Number(req.query.expenseId) : null;

    const comments = await prisma.comment.findMany({
      where: expenseId
        ? {
            expenseId,
          }
        : undefined,

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },

        expense: {
          select: {
            id: true,
            description: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    success(res, comments);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/comments/:id
 */
export async function getCommentById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },

        expense: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    if (!comment) {
      return failure(res, "Comment not found.", 404);
    }

    success(res, comment);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/comments
 */
export async function createComment(req, res, next) {
  try {
    requireFields(req.body, ["expenseId", "userId", "text"]);

    const expenseId = Number(req.body.expenseId);

    const userId = Number(req.body.userId);

    const text = req.body.text?.trim();

    if (!text) {
      return failure(res, "Comment text is required.", 400);
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
    });

    if (!expense) {
      return failure(res, "Expense not found.", 404);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        expenseId,
        userId,
        text,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },

        expense: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    success(res, comment, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/comments/:id
 *
 * TEMPORARY:
 * userId is sent in the request body until
 * authentication/login is implemented.
 */
export async function updateComment(req, res, next) {
  try {
    const id = Number(req.params.id);

    const userId = Number(req.body.userId);

    const text = req.body.text?.trim();

    if (!userId) {
      return failure(res, "User ID is required.", 400);
    }

    if (!text) {
      return failure(res, "Comment text is required.", 400);
    }

    const existing = await prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Comment not found.", 404);
    }

    // 🟢 Only the person who wrote the
    // comment can edit it.
    if (Number(existing.userId) !== userId) {
      return failure(res, "You can only edit your own comments.", 403);
    }

    const updated = await prisma.comment.update({
      where: {
        id,
      },

      data: {
        text,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },

        expense: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    success(res, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/comments/:id
 *
 * TEMPORARY:
 * userId is supplied through the query string
 * until authentication/login is implemented.
 *
 * DELETE /api/comments/:id?userId=3
 */
export async function deleteComment(req, res, next) {
  try {
    const id = Number(req.params.id);

    const userId = Number(req.query.userId);

    if (!userId) {
      return failure(res, "User ID is required.", 400);
    }

    const existing = await prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return failure(res, "Comment not found.", 404);
    }

    // 🟢 Only the person who wrote the
    // comment can delete it.
    if (Number(existing.userId) !== userId) {
      return failure(res, "You can only delete your own comments.", 403);
    }

    await prisma.comment.delete({
      where: {
        id,
      },
    });

    success(res, {
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
