import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../db/prisma.js";
import { success, failure } from "../utils/apiResponse.js";
import { requireFields } from "../utils/validators.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "temporary-uome-development-secret";

/**
 * Create a signed login token.
 */
function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

/**
 * Detect whether an existing password
 * is already stored as a bcrypt hash.
 */
function isBcryptHash(password) {
  return (
    typeof password === "string" &&
    (password.startsWith("$2a$") ||
      password.startsWith("$2b$") ||
      password.startsWith("$2y$"))
  );
}

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    requireFields(req.body, ["name", "email", "password"]);

    const name = String(req.body.name).trim();

    const email = String(req.body.email).trim().toLowerCase();

    const password = String(req.body.password);

    if (name.length < 2) {
      return failure(res, "Please enter your name.", 400);
    }

    if (password.length < 6) {
      return failure(res, "Password must be at least 6 characters.", 400);
    }

    const existing = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existing) {
      return failure(res, "An account already exists with this email.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },

      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = createToken(user);

    success(
      res,
      {
        user,
        token,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    requireFields(req.body, ["email", "password"]);

    const email = String(req.body.email).trim().toLowerCase();

    const password = String(req.body.password);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return failure(res, "Invalid email or password.", 401);
    }

    let passwordMatches = false;

    /*
     * 🟢 EXISTING DEVELOPMENT USERS
     *
     * Your current database may contain
     * plain-text passwords from before
     * authentication was added.
     *
     * We allow those users to log in once,
     * then immediately upgrade their stored
     * password to bcrypt.
     */
    if (isBcryptHash(user.password)) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = password === user.password;

      if (passwordMatches) {
        const upgradedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            password: upgradedPassword,
          },
        });
      }
    }

    if (!passwordMatches) {
      return failure(res, "Invalid email or password.", 401);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const token = createToken(safeUser);

    success(res, {
      user: safeUser,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 *
 * Used later for checking an authenticated user.
 */
export async function getCurrentUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return failure(res, "Authentication required.", 401);
    }

    const token = authHeader.substring(7);

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return failure(res, "Invalid or expired login.", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(decoded.userId),
      },

      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return failure(res, "User not found.", 404);
    }

    success(res, user);
  } catch (error) {
    next(error);
  }
}
