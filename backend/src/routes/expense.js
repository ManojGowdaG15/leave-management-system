import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { submitExpense, expenseHistory } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitExpense);
router.get("/history", authMiddleware, expenseHistory);

export default router;
