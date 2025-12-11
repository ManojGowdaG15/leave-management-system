import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, AlertCircle, Coffee, Heart, Award } from 'lucide-react';
import { validateLeaveApplication } from '../../utils/validations';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ApplyLeave = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    leaveType: 'casual',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  const leaveTypes = [
    {
      value: 'casual',
      label: 'Casual Leave',
      icon: Coffee,
      description: 'For personal work or casual purposes',
      color: 'bg-blue-100 text-blue-800',
      available: user?.leaveBalance?.casual || 0,
    },
    {
      value: 'sick',
      label: 'Sick Leave',
      icon: Heart,
      description: 'For medical reasons or health issues',
      color: 'bg-red-100 text-red-800',
      available: user?.leaveBalance?.sick || 0,
    },
    {
      value: 'earned',
      label: 'Earned Leave',
      icon: Award,
      description: 'Accrued leaves based on service period',
      color: 'bg-green-100 text-green-800',
      available: user?.leaveBalance?.earned || 0,
    },
  ];

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    
    // Clear errors for the changed field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-calculate end date if it's before start date
    if (field === 'startDate' && formData.endDate && date > formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: date }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateLeaveApplication(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check leave balance
    const selectedLeave = leaveTypes.find(l => l.value === formData.leaveType);
    const days = calculateDays();
    if (selectedLeave.available < days) {
      toast.error(`Insufficient ${selectedLeave.label} balance. Available: ${selectedLeave.available} days`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveType: formData.leaveType,
        reason: formData.reason,
      };
      
      await leaveAPI.applyLeave(payload);
      
      toast.success('Leave application submitted successfully!');
      
      // Reset form
      setFormData({
        startDate: null,
        endDate: null,
        leaveType: 'casual',
        reason: '',
      });
      setErrors({});
      
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      startDate: null,
      endDate: null,
      leaveType: 'casual',
      reason: '',
    });
    setErrors({});
  };

  const days = calculateDays();
  const selectedLeave = leaveTypes.find(l => l.value === formData.leaveType);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-600">Submit a new leave request for manager approval</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Leave Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Leave Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, leaveType: type.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.leaveType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <type.icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-').replace('100', '600')}`} />
                    <span className={`text-xs px-2 py-1 rounded-full ${type.color}`}>
                      {type.available} days left
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  className={`input ${errors.startDate ? 'border-danger-500' : ''}`}
                  placeholderText="Select start date"
                  minDate={new Date()}
                  dateFormat="dd MMM yyyy"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  className={`input ${errors.endDate ? 'border-danger-500' : ''}`}
                  placeholderText="Select end date"
                  minDate={formData.startDate || new Date()}
                  dateFormat="dd MMM yyyy"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-danger-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, reason: e.target.value }));
                if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
              }}
              className={`input min-h-[120px] ${errors.reason ? 'border-danger-500' : ''}`}
              placeholder="Please provide a detailed reason for your leave application..."
              maxLength={500}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-danger-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.reason}
              </p>
            )}
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Maximum 500 characters
              </p>
              <p className="text-xs text-gray-500">
                {formData.reason.length}/500
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Leave Type</p>
                <div className="flex items-center">
                  {selectedLeave && <selectedLeave.icon className="h-5 w-5 mr-2" />}
                  <p className="font-medium text-gray-900 capitalize">
                    {formData.leaveType} Leave
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {days} day{days !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Balance After Leave</p>
                <p className="font-medium text-gray-900">
                  {selectedLeave ? selectedLeave.available - days : 0} days
                </p>
              </div>
            </div>
            
            {selectedLeave && days > selectedLeave.available && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Warning: You're applying for more days than available!
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
            >
              Clear All
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
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