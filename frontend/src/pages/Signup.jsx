import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { 
  Eye, EyeOff, User, Mail, Shield, Building, 
  Lock, Check, Users, Briefcase, ChevronDown, Plus, X 
} from "lucide-react";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "" });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [selectedRole, setSelectedRole] = useState("employee");
  const [showOtherDepartment, setShowOtherDepartment] = useState(false);
  const [otherDepartmentName, setOtherDepartmentName] = useState("");

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const selectedDepartment = watch("department", "");

  // Pre-defined departments as fallback
  const defaultDepartments = [
    { _id: "eng", name: "Engineering", code: "ENG" },
    { _id: "sales", name: "Sales", code: "SAL" },
    { _id: "marketing", name: "Marketing", code: "MKT" },
    { _id: "hr", name: "Human Resources", code: "HR" },
    { _id: "finance", name: "Finance", code: "FIN" },
    { _id: "operations", name: "Operations", code: "OPS" },
    { _id: "product", name: "Product Management", code: "PM" },
    { _id: "qa", name: "Quality Assurance", code: "QA" },
    { _id: "support", name: "Customer Support", code: "CS" },
    { _id: "rd", name: "Research & Development", code: "R&D" },
    { _id: "it", name: "Information Technology", code: "IT" },
    { _id: "legal", name: "Legal", code: "LEG" }
  ];

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments");
      if (res.data.success) {
        setDepartments(res.data.data);
      } else {
        // Use default departments if API fails
        setDepartments(defaultDepartments);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      // Use default departments as fallback
      setDepartments(defaultDepartments);
      toast.info("Using default department list");
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Handle department selection change
  useEffect(() => {
    if (selectedDepartment === "other") {
      setShowOtherDepartment(true);
      setValue("customDepartment", "");
    } else {
      setShowOtherDepartment(false);
      setValue("customDepartment", "");
    }
  }, [selectedDepartment, setValue]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }

    let score = 0;
    let messages = [];

    // Length check
    if (password.length >= 8) score += 1;
    else messages.push("At least 8 characters");

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;
    else messages.push("One uppercase letter");

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;
    else messages.push("One lowercase letter");

    // Contains numbers
    if (/[0-9]/.test(password)) score += 1;
    else messages.push("One number");

    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else messages.push("One special character");

    // Determine strength message
    let message = "";
    if (score === 5) message = "Strong password";
    else if (score >= 3) message = "Medium strength";
    else if (score >= 1) message = "Weak password";
    else message = "Very weak password";

    setPasswordStrength({ 
      score, 
      message,
      suggestions: messages
    });
  }, [password]);

  // Check password match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  const getStrengthColor = (score) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    if (score >= 1) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthTextColor = (score) => {
    if (score >= 4) return "text-green-500";
    if (score >= 3) return "text-yellow-500";
    if (score >= 1) return "text-orange-500";
    return "text-red-500";
  };

  const onSubmit = async (data) => {
    if (!passwordMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Please use a stronger password");
      return;
    }

    if (!data.department) {
      toast.error("Please select a department");
      return;
    }

    if (data.department === "other" && !data.customDepartment) {
      toast.error("Please enter your department name");
      return;
    }

    setLoading(true);
    try {
      // If "Other" department is selected, send custom department name
      const signupData = {
        ...data,
        department: data.department === "other" ? data.customDepartment : data.department
      };

      const res = await axios.post("http://localhost:5000/api/auth/signup", signupData);
      login(res.data.token, res.data.user);
      toast.success("Account created successfully! Welcome aboard!");
      navigate("/employee");
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "One uppercase letter", regex: /[A-Z]/ },
    { label: "One lowercase letter", regex: /[a-z]/ },
    { label: "One number", regex: /[0-9]/ },
    { label: "One special character", regex: /[^A-Za-z0-9]/ }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Join Your Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account to access leave and expense management
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("name", { 
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                      }
                    })}
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Position Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position/Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("position")}
                    type="text"
                    placeholder="Software Engineer"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register("department", { required: "Department is required" })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
                  disabled={loadingDepartments}
                >
                  <option value="">Select your department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                  <option value="other" className="text-green-600 font-medium">
                    🆕 Other (Specify below)
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>
              )}
              {loadingDepartments && (
                <p className="mt-1 text-sm text-gray-500">Loading departments...</p>
              )}
            </div>

            {/* Custom Department Input (Shows when "Other" is selected) */}
            {showOtherDepartment && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center mb-2">
                  <Plus className="h-5 w-5 text-green-600 mr-2" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Your Department Name
                  </label>
                </div>
                <div className="relative">
                  <input
                    {...register("customDepartment", { 
                      required: showOtherDepartment ? "Department name is required" : false,
                      minLength: {
                        value: 2,
                        message: "Department name must be at least 2 characters"
                      }
                    })}
                    type="text"
                    placeholder="e.g., Data Science, Business Analytics, Supply Chain"
                    className="w-full pl-4 pr-4 py-3 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                {errors.customDepartment && (
                  <p className="mt-1 text-sm text-red-500">{errors.customDepartment.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Your new department will be created and you'll be the first member
                </p>
              </motion.div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register("role", { required: "Please select a role" })}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="employee">👤 Employee - Submit leaves and expenses</option>
                  <option value="department_manager">👨‍💼 Department Manager - Approve team requests</option>
                  <option value="admin" disabled>⚙️ System Admin - Full system access</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {selectedRole === "employee" && "You'll be able to submit leaves and expenses"}
                {selectedRole === "department_manager" && "You'll be able to approve team requests and view department reports"}
                {selectedRole === "admin" && "Full system access - requires administrator approval"}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Create Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("confirmPassword", { 
                      required: "Please confirm your password"
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      confirmPassword 
                        ? passwordMatch 
                          ? "border-green-500 focus:ring-green-500" 
                          : "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-green-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {confirmPassword && !passwordMatch && (
                  <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && passwordMatch && (
                  <p className="mt-1 text-sm text-green-500">✓ Passwords match</p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Password Requirements:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {passwordRequirements.map((req, index) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div key={index} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${isMet ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        {isMet && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Password Strength Meter */}
              {password && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Password strength
                    </span>
                    <span className={`text-sm font-medium ${getStrengthTextColor(passwordStrength.score)}`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-full ${
                          index <= passwordStrength.score 
                            ? getStrengthColor(passwordStrength.score) 
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                {...register("terms", { required: "You must accept the terms and conditions" })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{" "}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                  Privacy Policy
                </a>
                <p className="text-gray-500 text-xs mt-1">
                  By creating an account, you agree that your department manager and HR can view your leave and expense data.
                </p>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Join My Team"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              ← Back to login
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data is secured with enterprise-grade encryption. We never store your password in plain text.
              </p>
            </div>
          </div>
        </div>

        {/* Department Categories */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-4">
            Popular Departments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {defaultDepartments.slice(0, 8).map((dept) => (
              <div 
                key={dept._id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-colors cursor-default"
              >
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{dept.code}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{dept.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}