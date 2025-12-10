import express from "express";
import { check, validationResult } from "express-validator";
import User from "../models/User.js";
import Department from "../models/Department.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Password validation middleware
const passwordValidation = [
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
];

const emailValidation = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

// Get all departments (for signup form)
router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select("name code description manager")
      .sort("name");
    
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load departments"
    });
  }
});

// Signup with department support
router.post("/signup", [
  ...emailValidation,
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  ...passwordValidation,
  check('role')
    .optional()
    .isIn(['employee', 'department_manager', 'admin'])
    .withMessage('Invalid role'),
  check('department')
    .notEmpty()
    .withMessage('Department is required'),
  check('position')
    .optional()
    .trim()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  const { name, email, password, role = 'employee', department, position } = req.body;
  
  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    let departmentId = department;
    let departmentDoc = null;

    // Check if department is a MongoDB ObjectId (existing department)
    if (department.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an existing department ID
      departmentDoc = await Department.findById(department);
      if (!departmentDoc) {
        return res.status(400).json({
          success: false,
          message: "Selected department not found"
        });
      }
      departmentId = departmentDoc._id;
    } else {
      // It's a custom department name (string)
      // Check if department already exists with this name
      departmentDoc = await Department.findOne({ 
        name: { $regex: new RegExp(`^${department}$`, 'i') } 
      });
      
      if (departmentDoc) {
        // Department exists, use it
        departmentId = departmentDoc._id;
      } else {
        // Create new department
        // Generate department code from name
        const code = department
          .replace(/[^a-zA-Z0-9]/g, '')
          .substring(0, 3)
          .toUpperCase();
          
        // Ensure code is unique
        let uniqueCode = code;
        let counter = 1;
        while (await Department.findOne({ code: uniqueCode })) {
          uniqueCode = `${code}${counter}`;
          counter++;
        }
        
        departmentDoc = await Department.create({
          name: department,
          code: uniqueCode,
          description: `Custom department created by ${name}`,
          employeeCount: 1
        });
        
        departmentId = departmentDoc._id;
      }
    }

    // If user is department manager, update department
    if (role === 'department_manager' && departmentDoc) {
      // Check if department already has a manager
      if (departmentDoc.manager) {
        return res.status(400).json({
          success: false,
          message: "This department already has a manager"
        });
      }
    }

    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      department: departmentId,
      position: position || null
    });

    // If user is department manager, update department
    if (role === 'department_manager' && departmentDoc) {
      departmentDoc.manager = user._id;
      await departmentDoc.save();
    }

    // Update department employee count
    if (departmentDoc) {
      departmentDoc.employeeCount += 1;
      await departmentDoc.save();
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        department: departmentId
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    // Populate department info
    const populatedUser = await User.findById(user._id)
      .populate('department', 'name code')
      .select('-password -failedLoginAttempts -isLocked');

    res.status(201).json({ 
      success: true,
      token, 
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        position: populatedUser.position,
        department: populatedUser.department,
        employeeId: populatedUser.employeeId
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Login
router.post("/login", [
  ...emailValidation,
  check('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  const { email, password } = req.body;
  
  try {
    // Find user with password field and populate department
    const user = await User.findOne({ email })
      .select("+password +failedLoginAttempts +isLocked +lastFailedLogin")
      .populate('department', 'name code');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check if account is locked
    if (user.isLocked && user.lastFailedLogin) {
      const lockTime = 15 * 60 * 1000; // 15 minutes
      const timeSinceLock = Date.now() - user.lastFailedLogin;
      
      if (timeSinceLock < lockTime) {
        const minutesLeft = Math.ceil((lockTime - timeSinceLock) / 60000);
        return res.status(403).json({ 
          success: false,
          message: `Account locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` 
        });
      } else {
        // Auto-unlock account
        user.isLocked = false;
        user.failedLoginAttempts = 0;
      }
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = Date.now();
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        await user.save();
        return res.status(403).json({ 
          success: false,
          message: "Account locked due to too many failed attempts. Please contact administrator or try again in 15 minutes." 
        });
      }
      
      await user.save();
      
      const attemptsLeft = 5 - user.failedLoginAttempts;
      return res.status(401).json({ 
        success: false,
        message: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.` 
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLogin = Date.now();
    user.isLocked = false;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        department: user.department?._id
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    // Remove sensitive data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      employeeId: user.employeeId,
      department: user.department,
      lastLogin: user.lastLogin
    };

    res.json({ 
      success: true,
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Reset Password
router.post("/reset-password", [
  ...emailValidation,
  ...passwordValidation,
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  const { email, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password cannot be the same as the old password" 
      });
    }

    // Update password
    user.password = newPassword;
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lastPasswordChange = Date.now();
    await user.save();

    res.json({ 
      success: true,
      message: "Password reset successful. You can now login with your new password." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Check password strength
router.post("/check-password-strength", [
  check('password')
    .notEmpty()
    .withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { password } = req.body;
  let score = 0;
  const requirements = [];

  // Check requirements
  if (password.length >= 8) {
    score += 1;
  } else {
    requirements.push("At least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one number");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one special character");
  }

  // Determine strength
  let strength = "Very Weak";
  if (score === 5) strength = "Strong";
  else if (score >= 3) strength = "Medium";
  else if (score >= 1) strength = "Weak";

  res.json({
    success: true,
    score,
    strength,
    requirements,
    isValid: score === 5
  });
});

// Get current user info (protected route example)
router.get("/me", async (req, res) => {
  try {
    // This would typically be protected with middleware
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('department', 'name code manager')
      .select('-password -failedLoginAttempts -isLocked');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

export default router;