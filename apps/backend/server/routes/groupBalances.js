import express from "express";

import { getGroupBalances } from "../controllers/groupBalanceController.js";

const router = express.Router();

router.get("/:groupId/balances", getGroupBalances);

export default router;
