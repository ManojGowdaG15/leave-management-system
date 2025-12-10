import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User not authorized or inactive"
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token"
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Department manager authorization
const authorizeDepartmentManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("department");
    
    if (user.role === "admin" || user.role === "department_manager") {
      // Check if department manager is managing this department
      if (user.role === "department_manager" && req.params.departmentId) {
        if (user.department._id.toString() !== req.params.departmentId) {
          return res.status(403).json({
            success: false,
            message: "You can only manage your own department"
          });
        }
      }
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized as department manager"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export { protect, authorize, authorizeDepartmentManager };