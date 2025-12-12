import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, AlertCircle } from 'lucide-react';
import './ApplyLeave.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const days = calculateDays();
    if (days < 1) {
      setError('End date must be after start date');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit leave application');
      }

      setSuccess('Leave application submitted successfully!');
      setFormData({
        type: 'casual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="apply-leave-container">
      <div className="apply-leave-card">
        {/* Header */}
        <div className="page-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>Apply for Leave</h1>
          <p>Submit a new leave request</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="leave-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {/* Leave Type */}
          <div className="form-group">
            <label>Leave Type</label>
            <div className="leave-type-options">
              {['casual', 'sick', 'earned'].map((type) => (
                <label key={type} className="type-option">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                  />
                  <div className="option-content">
                    <div className={`type-icon ${type}`}>
                      {type === 'casual' && '🎯'}
                      {type === 'sick' && '🏥'}
                      {type === 'earned' && '⭐'}
                    </div>
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} Leave</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <Calendar size={16} />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                required
              />
            </div>
          </div>

          {/* Days Counter */}
          <div className="days-counter">
            <div className="days-label">Total Days</div>
            <div className="days-value">{calculateDays()}</div>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label>
              <FileText size={16} />
              Reason for Leave
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter the reason for your leave..."
              rows="4"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </div>
        </form>

        {/* Leave Guidelines */}
        <div className="guidelines">
          <h3>Leave Guidelines</h3>
          <ul>
            <li>Apply for casual leaves at least 1 day in advance</li>
            <li>Medical certificate required for sick leaves beyond 3 days</li>
            <li>Earned leaves can be encashed or carried forward (max 30 days)</li>
            <li>Check your leave balance before applying</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Add this component
const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default ApplyLeave;