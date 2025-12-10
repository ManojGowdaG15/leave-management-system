import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login Successful!');
      if (res.data.user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong email or password');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-white shadow-2xl">
          <div className="card-body">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FlowLeave
            </h1>
            <p className="text-center text-gray-600 mt-2">Leave & Expense Management</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <input
                type="email"
                placeholder="emp@company.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="password123"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </form>

            <div className="divider">Test Accounts</div>
            <div className="text-sm text-center space-y-1">
              <p><strong>Employee:</strong> emp@company.com / password123</p>
              <p><strong>Manager:</strong> mgr@company.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}