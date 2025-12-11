import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, AlertCircle } from 'lucide-react';

const ApplyLeave = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    leaveType: 'casual',
    reason: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
      setFormData({
        startDate: null,
        endDate: null,
        leaveType: 'casual',
        reason: ''
      });
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const diff = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
          <p className="text-sm text-gray-600">Submit your leave request for approval</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData({...formData, startDate: date})}
              className="input-field"
              placeholderText="Select start date"
              minDate={new Date()}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
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
              onChange={(date) => setFormData({...formData, endDate: date})}
              className="input-field"
              placeholderText="Select end date"
              minDate={formData.startDate || new Date()}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['casual', 'sick', 'earned'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, leaveType: type})}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.leaveType === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                  {type} Leave
                </div>
                <div className="text-xs text-gray-500">
                  {type === 'casual' ? 'Personal work' : 
                   type === 'sick' ? 'Medical reasons' : 'Accrued leaves'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Leave *
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            className="input-field min-h-[100px]"
            placeholder="Please provide a reason for your leave..."
            rows="3"
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.reason}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-2xl font-bold text-gray-900">{calculateDays()} days</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Leave Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {formData.leaveType} Leave
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setFormData({
              startDate: null,
              endDate: null,
              leaveType: 'casual',
              reason: ''
            })}
            className="btn-secondary"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;