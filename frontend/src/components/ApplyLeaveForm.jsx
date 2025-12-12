import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { Calendar, AlertCircle } from 'lucide-react';

const ApplyLeaveForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        startDate: new Date(),
        endDate: new Date(),
        leaveType: 'casual',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate > formData.endDate) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        
        setLoading(true);
        
        try {
            // Calculate days count
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            const dataToSend = {
                ...formData,
                startDate: formData.startDate.toISOString().split('T')[0],
                endDate: formData.endDate.toISOString().split('T')[0],
                daysCount
            };
            
            await leaveAPI.applyLeave(dataToSend);
            
            toast.success('Leave application submitted successfully!');
            setFormData({
                startDate: new Date(),
                endDate: new Date(),
                leaveType: 'casual',
                reason: ''
            });
            
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit leave application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateChange(date, 'startDate')}
                            dateFormat="yyyy-MM-dd"
                            minDate={new Date()}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                errors.startDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.startDate}
                        </p>
                    )}
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => handleDateChange(date, 'endDate')}
                            dateFormat="yyyy-MM-dd"
                            minDate={formData.startDate}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                errors.endDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.endDate}
                        </p>
                    )}
                </div>
            </div>

            {/* Leave Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['casual', 'sick', 'earned'].map((type) => (
                        <label
                            key={type}
                            className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                formData.leaveType === type
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="leaveType"
                                value={type}
                                checked={formData.leaveType === type}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium capitalize">{type} Leave</span>
                        </label>
                    ))}
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
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.reason ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Please provide a reason for your leave application..."
                />
                {errors.reason && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.reason}
                    </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                    Please be specific about your reason for leave.
                </p>
            </div>

            {/* Days Count Display */}
            {formData.startDate && formData.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900">
                                Leave Duration
                            </p>
                            <p className="text-sm text-blue-700">
                                {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-900">
                                {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1}
                            </p>
                            <p className="text-sm text-blue-700">day(s)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        'Submit Leave Application'
                    )}
                </button>
                <p className="mt-2 text-xs text-gray-500 text-center">
                    Your application will be sent to your manager for approval.
                </p>
            </div>
        </form>
    );
};

export default ApplyLeaveForm;