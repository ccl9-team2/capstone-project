import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import userRoutes from "./routes/users.js";
import groupRoutes from "./routes/groups.js";
import expenseRoutes from "./routes/expenses.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
