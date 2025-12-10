import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from 'lucide-react';
import { leaveService } from '../services/leave';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'casual',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    const newErrors = {};
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      await leaveService.applyLeave(formData);
      navigate('/leave-history');
    } catch (error) {
      console.error('Failed to apply leave:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave', color: 'bg-blue-100 text-blue-800' },
    { value: 'sick', label: 'Sick Leave', color: 'bg-green-100 text-green-800' },
    { value: 'earned', label: 'Earned Leave', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-600 mt-2">Submit a new leave request</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Leave Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveTypes.map((type) => (
                <div key={type.value}>
                  <input
                    type="radio"
                    id={type.value}
                    name="leave_type"
                    value={type.value}
                    checked={formData.leave_type === type.value}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <label
                    htmlFor={type.value}
                    className={`
                      flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all
                      peer-checked:border-blue-500 peer-checked:bg-blue-50
                      hover:border-gray-300 hover:bg-gray-50
                      ${formData.leave_type === type.value ? type.color : 'border-gray-200'}
                    `}
                  >
                    <span className="font-medium">{type.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.start_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  errors.end_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Please provide a detailed reason..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <X className="h-4 w-4 inline mr-2" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Submit Leave Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;