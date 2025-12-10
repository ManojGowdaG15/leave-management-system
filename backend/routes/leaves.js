import express from "express";
import Leave from "../models/Leave.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply Leave (Employee)
router.post("/", protect, async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  try {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const leave = await Leave.create({ ...req.body, user: req.user._id, days });
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get My Leaves
router.get("/my", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).populate("user", "name");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Leaves (Manager/Admin)
router.get("/", protect, authorize("manager", "admin"), async (req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject
router.put("/:id", protect, authorize("manager", "admin"), async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email leaveBalance");
    if (status === "approved") {
      leave.user.leaveBalance[leave.type] -= leave.days;
      await leave.user.save();
    }
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;