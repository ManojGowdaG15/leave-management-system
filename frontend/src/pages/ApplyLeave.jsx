import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  CalendarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ApplyLeave = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Casual',
    start_date: '',
    end_date: '',
    reason: '',
    contact_during_leave: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/leaves/apply', {
        ...formData,
        days: days
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Leave application submitted successfully');
      navigate('/leave-history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Apply for Leave</h1>
        <p className="text-gray-600 mt-2">Submit a new leave request</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Casual', 'Sick', 'Earned'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, leave_type: type }))}
                  className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.leave_type === type 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  {type} Leave
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Days Calculation */}
          {formData.start_date && formData.end_date && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">
                    Total Leave Days: {calculateDays()} day(s)
                  </span>
                </div>
                {calculateDays() > 5 && (
                  <span className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                    Long leave - requires advance notice
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Please provide a reason for your leave..."
              required
            />
          </div>

          {/* Contact Info */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact During Leave
            </label>
            <input
              type="text"
              name="contact_during_leave"
              value={formData.contact_during_leave}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Phone number or email (optional)"
            />
            <p className="text-sm text-gray-500 mt-2">
              Provide contact information if you need to be reached during your leave
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Submit Leave Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Leave Policy Info */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
          Leave Policy Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Casual Leave</h4>
              <p className="text-sm text-gray-600">Apply at least 1 day in advance</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Sick Leave</h4>
              <p className="text-sm text-gray-600">Medical certificate required for 3+ days</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Earned Leave</h4>
              <p className="text-sm text-gray-600">Apply up to 30 days in advance</p>
            </div>
          </div>
          <div className="flex items-start">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800">Important</h4>
              <p className="text-sm text-gray-600">Don't apply during peak work periods</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;