import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        toast.success("Employee deleted!");
        fetchEmployees();
      } catch (err) {
        toast.error("Failed to delete employee");
      }
    }
  };

  const filteredEmployees = employees.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 p-4">
        <div className="max-w-4xl mx-auto glass p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Employees</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded p-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 p-4 bg-gradient-to-br from-blue-400 to-purple-600">
      <div className="max-w-4xl mx-auto glass p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-6 animate-fade-in">Employee Directory</h2>
        
        <input
          type="text"
          placeholder="Search by name or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-300">No employees found.</p>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((e) => (
              <div key={e._id} className="glass p-4 rounded-lg flex justify-between items-center animate-slide-up">
                <div>
                  <h3 className="text-xl font-semibold text-white">{e.name}</h3>
                  <p className="text-gray-300">{e.position} | ${e.salary}</p>
                  <p className="text-gray-400 text-sm">{e.email}</p>
                </div>
                <div className="space-x-2">
                  <Link
                    to={`/edit/${e._id}`}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}