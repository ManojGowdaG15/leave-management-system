import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === "manager" ? "/manager" : "/employee");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            LeavePro
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </div>

        <div className="glass rounded-3xl shadow-2xl p-10 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                })}
                type="email"
                placeholder="john@company.com"
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition"
              />
              {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Password</label>
              <input
                {...register("password", { required: "Password is required" })}
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl bg-white/70 dark:bg-white/10 border border-white/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <Link to="/reset-password" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
              Forgot password?
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}