import jwt from "jsonwebtoken";

import prisma from "../db/prisma.js";
import { failure } from "../utils/apiResponse.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required.");
}

/**
 * Authentication middleware
 *
 * Reads the JWT from:
 *
 * Authorization: Bearer <token>
 *
 * Then loads the logged-in user and attaches:
 *
 * req.user = {
 *   id,
 *   name,
 *   email
 * }
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // =========================
    // TOKEN REQUIRED
    // =========================

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return failure(res, "Authentication required.", 401);
    }

    const token = authHeader.substring(7);

    let decoded;

    // =========================
    // VERIFY TOKEN
    // =========================

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return failure(res, "Invalid or expired login.", 401);
    }

    if (!decoded?.userId) {
      return failure(res, "Invalid login token.", 401);
    }

    // =========================
    // FIND LOGGED-IN USER
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        id: Number(decoded.userId),
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return failure(res, "Authenticated user not found.", 401);
    }

    // =========================
    // 🟢 AUTHENTICATED USER
    // =========================

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

export default authenticate;
