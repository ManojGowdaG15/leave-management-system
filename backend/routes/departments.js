import express from "express";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate("manager", "name email employeeId")
      .select("-__v");
    
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("manager", "name email employeeId position")
      .populate({
        path: "employees",
        select: "name email employeeId position role isActive",
        match: { isActive: true }
      });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @desc    Create department (Admin only)
// @route   POST /api/departments
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const department = await Department.create(req.body);
    
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department with this name or code already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @desc    Get department employees
// @route   GET /api/departments/:id/employees
// @access  Private
router.get("/:id/employees", protect, async (req, res) => {
  try {
    const employees = await User.find({ 
      department: req.params.id,
      isActive: true 
    })
    .select("name email employeeId role position joinDate")
    .sort("name");
    
    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// @desc    Get my department (for managers/employees)
// @route   GET /api/departments/my-department
// @access  Private
router.get("/my-department", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("department");
    
    if (!user.department) {
      return res.status(404).json({
        success: false,
        message: "You are not assigned to any department"
      });
    }
    
    const department = await Department.findById(user.department._id)
      .populate("manager", "name email employeeId")
      .populate({
        path: "employees",
        select: "name email employeeId position role",
        match: { isActive: true }
      });
    
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;