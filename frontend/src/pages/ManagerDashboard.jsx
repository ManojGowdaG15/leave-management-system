// frontend/src/pages/ManagerDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ToastContainer, toast } from 'react-toastify';

export default function ManagerDashboard() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to load team leaves");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(`Leave ${status}!`);
      fetchAllLeaves();
    } catch (err) {
      toast.error("Error updating leave");
    }
  };

  const events = leaves.map(l => ({
    title: `${l.user?.name || 'User'} (${l.type})`,
    start: l.startDate,
    end: new Date(new Date(l.endDate).setDate(new Date(l.endDate).getDate() + 1)), // FullCalendar needs +1 day
    backgroundColor: l.status === 'approved' ? '#10b981' : l.status === 'rejected' ? '#ef4444' : '#f59e0b',
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8">Manager Dashboard – Team Overview</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pending Leave Requests</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.filter(l => l.status === 'pending').map(l => (
                    <tr key={l._id}>
                      <td>{l.user?.name}</td>
                      <td>{l.type}</td>
                      <td>{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</td>
                      <td>{l.reason}</td>
                      <td className="space-x-2">
                        <button onClick={() => updateStatus(l._id, 'approved')} className="btn btn-success btn-sm">Approve</button>
                        <button onClick={() => updateStatus(l._id, 'rejected')} className="btn btn-error btn-sm">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Team Leave Calendar</h2>
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="500px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}