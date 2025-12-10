import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../context/AuthContext.jsx";  // Fixed path here!
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      setLeaves(res.data);
    } catch (error) {
      toast.error("Failed to fetch leaves");
      console.error(error);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status });
      toast.success(`Leave ${status}!`);
      fetchLeaves();
    } catch (error) {
      toast.error("Failed to update leave");
      console.error(error);
    }
  };

  const events = leaves.map((leave) => ({
    title: `${leave.user?.name || 'Unknown'} - ${leave.type}`,
    start: new Date(leave.startDate),
    end: new Date(leave.endDate),
    backgroundColor: leave.status === "approved" ? "#10b981" : leave.status === "pending" ? "#f59e0b" : "#ef4444",
    borderColor: leave.status === "approved" ? "#10b981" : leave.status === "pending" ? "#f59e0b" : "#ef4444"
  }));

  if (!user || user.role !== "manager") {
    return <div className="min-h-screen pt-20 p-4 text-white text-center">Access Denied</div>;
  }

  return (
    <div className="min-h-screen pt-20 p-4 bg-gradient-to-br from-blue-400 to-purple-600">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center animate-fade-in">Manager Dashboard</h1>
        
        {/* Pending Approvals Table */}
        <div className="glass p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pending Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-2 text-left">Employee</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Dates</th>
                  <th className="p-2 text-left">Days</th>
                  <th className="p-2 text-left">Reason</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.filter(l => l.status === "pending").map((leave) => (
                  <tr key={leave._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2">{leave.user?.name}</td>
                    <td className="p-2">{leave.type}</td>
                    <td className="p-2">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="p-2">{leave.days}</td>
                    <td className="p-2">{leave.reason}</td>
                    <td className="p-2 space-x-2">
                      <button 
                        onClick={() => handleApprove(leave._id, "approved")} 
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleApprove(leave._id, "rejected")} 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {leaves.filter(l => l.status === "pending").length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-300">No pending leaves</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="glass p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Team Leave Calendar</h2>
          <FullCalendar 
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek"
            }}
            eventClick={(info) => {
              toast.info(`Click: ${info.event.title} (${info.event.extendedProps.status || 'N/A'})`);
            }}
          />
        </div>
      </div>
    </div>
  );
}