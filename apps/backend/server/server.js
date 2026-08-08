import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import friendshipRoutes from "./routes/friendships.js";
import notificationRoutes from "./routes/notifications.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/friendships", friendshipRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
