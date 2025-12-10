import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", position: "", salary: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/employees/${id}`)
      .then((res) => {
        setForm(res.data);
        setFetchLoading(false);
      })
      .catch(() => {
        toast.error("Employee not found");
        navigate("/");
      });
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
    if (!form.position.trim()) newErrors.position = "Position is required";
    if (!form.salary || isNaN(form.salary) || form.salary <= 0) newErrors.salary = "Valid salary is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/employees/${id}`, form);
      toast.success("Employee updated successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="min-h-screen pt-20 p-4 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-20 p-4 bg-gradient-to-br from-blue-400 to-purple-600">
      <div className="max-w-md mx-auto glass p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Edit Employee</h2>
        <div className="space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-300 text-sm">{errors.name}</p>}

          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}

          <input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.position && <p className="text-red-300 text-sm">{errors.position}</p>}

          <input
            type="number"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.salary && <p className="text-red-300 text-sm">{errors.salary}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg transition"
          >
            {loading ? "Updating..." : "Update Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}