import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  CalendarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const ApplyLeave = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
    contactDuringLeave: ''
  });
  
  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalance(response.data);
    } catch (err) {
      console.error('Failed to fetch leave balance:', err);
      toast.error('Failed to load leave balance');
    }
  };

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
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const validateForm = () => {
    const days = calculateDays();
    
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (days <= 0) {
      toast.error('End date must be after start date');
      return false;
    }

    // Check leave balance
    const availableLeaves = leaveBalance[`${formData.leaveType.toLowerCase()}Leaves`] || 0;
    if (availableLeaves < days) {
      toast.error(`Insufficient ${formData.leaveType} leave balance. Available: ${availableLeaves} days, Required: ${days} days`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const days = calculateDays();

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/leave/apply', {
        ...formData,
        contactDuringLeave: formData.contactDuringLeave || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Leave application submitted successfully');
      navigate('/leave-history');
    } catch (error) {
      console.error('Apply leave error:', error.response || error);
      toast.error(error.response?.data?.error || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeDetails = (type) => {
    const details = {
      Casual: {
        description: 'For personal or casual purposes',
        maxDays: leaveBalance.casualLeaves || 12,
        advanceNotice: '1 day'
      },
      Sick: {
        description: 'For medical reasons or health issues',
        maxDays: leaveBalance.sickLeaves || 10,
        advanceNotice: 'Can apply on same day'
      },
      Earned: {
        description: 'Accumulated earned leaves',
        maxDays: leaveBalance.earnedLeaves || 15,
        advanceNotice: '7 days'
      }
    };
    return details[type] || details.Casual;
  };

  const leaveDetails = getLeaveTypeDetails(formData.leaveType);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Apply for Leave</h1>
        <p className="text-gray-600 mt-2">Submit a new leave request</p>
      </div>

      {/* Leave Balance Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Casual Leaves</p>
              <h3 className="text-xl font-bold text-blue-600">{leaveBalance.casualLeaves || 12}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sick Leaves</p>
              <h3 className="text-xl font-bold text-yellow-600">{leaveBalance.sickLeaves || 10}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Earned Leaves</p>
              <h3 className="text-xl font-bold text-green-600">{leaveBalance.earnedLeaves || 15}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          {/* Leave Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Casual', 'Sick', 'Earned'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, leaveType: type }))}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    formData.leaveType === type 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <CalendarIcon className="h-8 w-8 mb-2" />
                  <span className="font-medium">{type} Leave</span>
                  <span className="text-sm mt-1">
                    {leaveBalance[`${type.toLowerCase()}Leaves`] || 0} days left
                  </span>
                </button>
              ))}
            </div>
            
            {/* Leave Type Details */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">{formData.leaveType} Leave Details:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span>{leaveDetails.description}</span>
                </div>
                <div className="flex items-center">
                  <CalculatorIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Available: {leaveDetails.maxDays} days</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Advance notice: {leaveDetails.advanceNotice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cannot select past dates
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be after start date
              </p>
            </div>
          </div>

          {/* Days Calculation */}
          {formData.startDate && formData.endDate && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-2 md:mb-0">
                  <CalculatorIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <span className="font-medium text-blue-800">
                      Total Leave Days: {calculateDays()} day(s)
                    </span>
                    <p className="text-sm text-blue-600 mt-1">
                      {leaveBalance[`${formData.leaveType.toLowerCase()}Leaves`] || 0} days available - {calculateDays()} days required
                    </p>
                  </div>
                </div>
                {calculateDays() > 5 && (
                  <span className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                    ⚠️ Long leave - requires advance notice
                  </span>
                )}
                {calculateDays() > (leaveBalance[`${formData.leaveType.toLowerCase()}Leaves`] || 0) && (
                  <span className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-full mt-2 md:mt-0">
                    ❌ Insufficient balance
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Please provide a detailed reason for your leave..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific about your reason for better approval chances
            </p>
          </div>

          {/* Contact Info */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact During Leave (Optional)
            </label>
            <input
              type="text"
              name="contactDuringLeave"
              value={formData.contactDuringLeave}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Phone number or email where you can be reached"
            />
            <p className="text-sm text-gray-500 mt-2">
              Provide contact information only if you need to be reached during your leave
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
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
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

      {/* Important Notes */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-bold text-yellow-800 mb-4 flex items-center">
          <XCircleIcon className="h-5 w-5 mr-2" />
          Important Notes Before Applying
        </h3>
        <ul className="text-yellow-700 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Once submitted, leave application cannot be edited. You can only cancel pending applications.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>For Sick Leaves exceeding 2 days, a medical certificate is mandatory.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Leaves applied during project deadlines may require additional approval.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Check with your team lead before applying for long leaves.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApplyLeave;