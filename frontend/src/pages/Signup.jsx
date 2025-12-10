import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Legal",
  "Executive"
];

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", data);
      login(res.data.token, { ...res.data.user, department: data.department });
      toast.success("Welcome to LeavePro! Your account is ready.");
      navigate(res.data.user.role === "manager" ? "/manager" : "/employee");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Join LeavePro
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
            Create your account and start managing leaves the smart way
          </p>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl shadow-2xl p-10 shadow-2xl border border-white/20"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Full Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="John Doe"
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Work Email
              </label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                placeholder="john@company.com"
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-900 dark:text-white"
              />
              {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
            </div>

            {/* Department — THE KEY PROFESSIONAL FEATURE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Department
              </label>
              <select
                {...register("department", { required: "Please select your department" })}
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-900 dark:text-white"
              >
                <option value="">Choose department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-2">{errors.department.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/30 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition">
                  <input {...register("role")} type="radio" value="employee" className="mr-3" defaultChecked />
                  <span className="font-medium">Employee</span>
                </label>
                <label className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/30 cursor-pointer hover:bg-white/70 dark:hover:bg-white/10 transition">
                  <input {...register("role")} type="radio" value="manager" className="mr-3" />
                  <span className="font-medium">Manager</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-gray-900 dark:text-white"
              />
              {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
          © 2025 LeavePro • Built for modern teams
        </p>
      </motion.div>
    </div>
  );
}