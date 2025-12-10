import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({});
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchLeaves();
    fetchBalance();
  }, []);

  const fetchLeaves = async () => {
    const res = await axios.get("http://localhost:5000/api/leaves/my");
    setLeaves(res.data);
  };

  const fetchBalance = async () => {
    const res = await axios.get("http://localhost:5000/api/users/profile");
    setBalance(res.data.leaveBalance);
  };

  const onSubmit = async (data) => {
    const { startDate, endDate } = data;
    data.days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    await axios.post("http://localhost:5000/api/leaves", data);
    toast.success("Leave applied!");
    reset();
    fetchLeaves();
  };

  return (
    <div className="min-h-screen pt-20 p-4">
      <div className="grid md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {/* Balance Cards */}
        <div className="glass p-4 rounded">
          <h2 className="text-xl font-bold text-white mb-4">Leave Balance</h2>
          <div className="space-y-2">
            {Object.entries(balance).map(([type, count]) => (
              <p key={type} className="text-white">{type.charAt(0).toUpperCase() + type.slice(1)}: {count} days</p>
            ))}
          </div>
        </div>

        {/* Apply Leave Form */}
        <div className="glass p-4 rounded">
          <h2 className="text-xl font-bold text-white mb-4">Apply Leave</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <select {...register("type")} className="w-full p-2 rounded bg-white/20 text-white">
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="annual">Annual</option>
            </select>
            <input {...register("startDate")} type="date" className="w-full p-2 rounded bg-white/20 text-white" />
            <input {...register("endDate")} type="date" className="w-full p-2 rounded bg-white/20 text-white" />
            <textarea {...register("reason")} placeholder="Reason" className="w-full p-2 rounded bg-white/20 text-white" />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Apply</button>
          </form>
        </div>

        {/* Leave History */}
        <div className="md:col-span-2 glass p-4 rounded">
          <h2 className="text-xl font-bold text-white mb-4">Leave History</h2>
          <div className="space-y-2">
            {leaves.map((leave) => (
              <div key={leave._id} className="p-2 bg-white/10 rounded">
                <p>{leave.type} - {leave.startDate} to {leave.endDate} ({leave.days} days) - Status: {leave.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}