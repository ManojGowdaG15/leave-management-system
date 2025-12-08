import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { applyLeave, leaveHistory, cancelLeave } from "../controllers/leaveController.js";

const router = express.Router();

router.post("/apply", authMiddleware, applyLeave);
router.get("/history", authMiddleware, leaveHistory);
router.patch("/cancel/:id", authMiddleware, cancelLeave);

export default router;
