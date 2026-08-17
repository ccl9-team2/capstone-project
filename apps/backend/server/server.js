import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import friendshipRoutes from "./routes/friendships.js";
import notificationRoutes from "./routes/notifications.js";
import commentRoutes from "./routes/comments.js";
import dashboardRoutes from "./routes/dashboard.js";
import statsRoutes from "./routes/stats.js";
import paymentRoutes from "./routes/payments.js";
import expenseSplitRoutes from "./routes/expenseSplits.js";
import userRoutes from "./routes/users.js";
import groupRoutes from "./routes/groups.js";
import expenseRoutes from "./routes/expenses.js";
import groupBalanceRoutes from "./routes/groupBalances.js";
import groupMemberRoutes from "./routes/groupMembers.js";

// 🟢 NEW - Authentication routes
import authRoutes from "./routes/auth.js";

import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const port = Number(process.env.PORT) || 3001;

// -------------------------
// Middleware
// -------------------------

app.use(cors());

app.use(express.json());

// -------------------------
// Health Check
// -------------------------

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,

    // 🟢 CHANGED
    // Updated app name.
    message: "UOME API is running.",
  });
});

// -------------------------
// API Routes
// -------------------------

// 🟢 NEW
// Registration, login, and current-user routes.
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/groups", groupRoutes);

app.use("/api/groups", groupMemberRoutes);

// Group balance routes use /api/groups
// alongside the regular group routes.
app.use("/api/groups", groupBalanceRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/friendships", friendshipRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/stats", statsRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/expense-splits", expenseSplitRoutes);

// -------------------------
// Error Handler
// -------------------------

app.use(errorHandler);

// -------------------------
// Start Server
// -------------------------

app.listen(port, () => {
  console.log(`UOME backend listening on http://localhost:${port}`);
});
