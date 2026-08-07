import express from "express";

import {
  getExpenseSplits,
  getExpenseSplitById,
  updateExpenseSplit
} from "../controllers/expenseSplitController.js";

const router = express.Router();

router.get("/", getExpenseSplits);
router.get("/:id", getExpenseSplitById);

router.patch("/:id", updateExpenseSplit);

export default router;