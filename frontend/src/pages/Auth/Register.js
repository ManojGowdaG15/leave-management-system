import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Building, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'employee',
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'IT',
    'Customer Support'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await authService.register(submitData);
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/login" className="back-link">
            <ArrowLeft size={20} />
            Back to Login
          </Link>
          <div className="logo">
            <UserPlus size={32} />
            <h1>Create Account</h1>
          </div>
          <p>Join the Leave Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Building size={18} />
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Employee ID (Optional)</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Enter employee ID"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={formData.role === 'employee'}
                  onChange={handleChange}
                />
                <div className="option-content">
                  <div className="role-icon">👨‍💼</div>
                  <div>
                    <h4>Employee</h4>
                    <p>Apply and track leaves</p>
                  </div>
                </div>
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={formData.role === 'manager'}
                  onChange={handleChange}
                />
                <div className="option-content">
                  <div className="role-icon">👔</div>
                  <div>
                    <h4>Manager</h4>
                    <p>Approve team leaves</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign In
              </Link>
            </p>
          </div>
        </form>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;