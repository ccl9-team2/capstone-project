import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

/**
 * GET /api/comments
 */
export async function getComments(req, res, next) {
  try {
    const comments = await prisma.comment.findMany({
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
      where: { id },
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

    const { expenseId, userId, text } = req.body;

    const expense = await prisma.expense.findUnique({
      where: {
        id: Number(expenseId),
      },
    });

    if (!expense) {
      return failure(res, "Expense not found.", 404);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    const comment = await prisma.comment.create({
      data: {
        expenseId: Number(expenseId),
        userId: Number(userId),
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
 */
export async function updateComment(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!req.body.text) {
      return failure(res, "Text is required.", 400);
    }

    const existing = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      return failure(res, "Comment not found.", 404);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        text: req.body.text,
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
 */
export async function deleteComment(req, res, next) {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existing) {
      return failure(res, "Comment not found.", 404);
    }

    await prisma.comment.delete({
      where: { id },
    });

    success(res, {
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}
