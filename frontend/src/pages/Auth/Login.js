import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test credentials
      const testUsers = {
        'manager@company.com': {
          password: 'manager123',
          user: {
            id: '1',
            name: 'John Manager',
            email: 'manager@company.com',
            role: 'manager',
            department: 'Management',
            employeeId: 'M001'
          }
        },
        'employee@company.com': {
          password: 'employee123',
          user: {
            id: '2',
            name: 'Jane Employee',
            email: 'employee@company.com',
            role: 'employee',
            department: 'Engineering',
            employeeId: 'E001'
          }
        },
        'admin@company.com': {
          password: 'admin123',
          user: {
            id: '3',
            name: 'Admin User',
            email: 'admin@company.com',
            role: 'admin',
            department: 'Administration',
            employeeId: 'A001'
          }
        }
      };

      const userData = testUsers[formData.email];

      if (!userData || userData.password !== formData.password) {
        throw new Error('Invalid email or password');
      }

      // Save to localStorage
      localStorage.setItem('token', 'fake-jwt-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData.user));

      toast.success('Login successful!');

      // Redirect based on role
      if (userData.user.role === 'manager' || userData.user.role === 'admin') {
        navigate('/manager/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <span role="img" aria-label="login">🔐</span>
            <h1>Leave Management System</h1>
          </div>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <span role="img" aria-label="email">📧</span>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <span role="img" aria-label="password">🔒</span>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <a href="/register" className="link">
                Sign Up
              </a>
            </p>
          </div>

          <div className="test-accounts">
            <h3>Test Accounts:</h3>
            <div className="accounts-grid">
              <div className="account-card">
                <h4>Employee</h4>
                <p><strong>Email:</strong> employee@company.com</p>
                <p><strong>Password:</strong> employee123</p>
              </div>
              <div className="account-card">
                <h4>Manager</h4>
                <p><strong>Email:</strong> manager@company.com</p>
                <p><strong>Password:</strong> manager123</p>
              </div>
              <div className="account-card">
                <h4>Admin</h4>
                <p><strong>Email:</strong> admin@company.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;