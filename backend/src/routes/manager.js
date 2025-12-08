import express from "express";
import { authMiddleware, managerOnly } from "../middlewares/auth.js";
import { pendingLeaves, approveLeave, rejectLeave } from "../controllers/managerController.js";

const router = express.Router();

router.get("/leaves/pending", authMiddleware, managerOnly, pendingLeaves);
router.patch("/leaves/approve/:id", authMiddleware, managerOnly, approveLeave);
router.patch("/leaves/reject/:id", authMiddleware, managerOnly, rejectLeave);

export default router;
