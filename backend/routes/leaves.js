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

// Get My Leaves (Employee)
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

//employee to cancel leave
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending leaves" });
    }
    leave.status = "Cancelled";
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject Leave
router.put("/:id", protect, authorize("manager", "admin"), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("user");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const { status, managerComments } = req.body;

    if (status === "approved") {
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1;
      if (leave.user.leaveBalance[leave.type] < days) {
        return res.status(400).json({ message: `Not enough ${leave.type} leave balance` });
      }
      leave.user.leaveBalance[leave.type] -= days;
      await leave.user.save();
    }

    leave.status = status || leave.status;
    leave.managerComments = managerComments;
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;