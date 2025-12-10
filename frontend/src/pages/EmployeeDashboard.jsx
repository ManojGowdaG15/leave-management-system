import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

export default function EmployeeDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ casual: 12, sick: 10, earned: 18 });
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to load leaves");
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/leaves", { ...form, user: user._id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Leave Applied Successfully!");
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves();
    } catch (err) {
      toast.error("Failed to apply leave");
    }
  };

  const cancelLeave = async (id) => {
    if (!confirm("Cancel this leave?")) return;
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, { status: 'Cancelled' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Leave Cancelled");
      fetchMyLeaves();
    } catch (err) {
      toast.error("Cannot cancel");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Casual Leave</h2>
            <p className="text-4xl font-bold text-blue-600">{balance.casual} days</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Sick Leave</h2>
            <p className="text-4xl font-bold text-green-600">{balance.sick} days</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Earned Leave</h2>
            <p className="text-4xl font-bold text-purple-600">{balance.earned} days</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Apply New Leave</h2>
            <form onSubmit={applyLeave} className="space-y-4">
              <select className="select select-bordered w-full" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
              </select>
              <input type="date" className="input input-bordered w-full" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} required />
              <input type="date" className="input input-bordered w-full" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} required />
              <textarea className="textarea textarea-bordered w-full" placeholder="Reason" value={form.reason} onChange={(e) => setForm({...form, reason:e.target.value})}></textarea>
              <button type="submit" className="btn btn-primary w-full">Apply Leave</button>
            </form>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">My Leave History</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.type}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-error' : leave.status === 'Cancelled' ? 'badge-ghost' : 'badge-warning'}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'pending' && (
                          <button onClick={() => cancelLeave(leave._id)} className="btn btn-error btn-xs">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}