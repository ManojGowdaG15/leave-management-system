// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { login } from '../services/api';
import { LogIn } from 'lucide-react';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'manager') {
      setFormData({ email: 'manager@company.com', password: 'manager123' });
    } else {
      setFormData({ email: 'alice@company.com', password: 'employee123' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <LogIn size={40} />
          <h1>Leave Management System</h1>
          <p>Sign in to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login">
          <p>Quick Login (For Testing):</p>
          <button onClick={() => handleQuickLogin('employee')} className="btn-secondary">
            Login as Employee
          </button>
          <button onClick={() => handleQuickLogin('manager')} className="btn-secondary">
            Login as Manager
          </button>
        </div>

        <div className="test-credentials">
          <h4>Test Credentials:</h4>
          <p><strong>Manager:</strong> manager@company.com / manager123</p>
          <p><strong>Employee:</strong> alice@company.com / employee123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;