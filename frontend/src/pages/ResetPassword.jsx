// Similar to Signup, but post to /reset-password, only email + newPassword
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", data);
      toast.success("Password reset! Login with new password.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 p-4 flex items-center justify-center">
      <div className="glass p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("email", { required: true })} placeholder="Email" className="w-full p-3 mb-4 rounded bg-white/20 text-white" />
          <input {...register("newPassword", { required: true })} type="password" placeholder="New Password" className="w-full p-3 mb-4 rounded bg-white/20 text-white" />
          <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white py-3 rounded">
            {loading ? "Resetting..." : "Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}