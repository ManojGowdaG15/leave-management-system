export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave', color: 'blue', icon: 'coffee' },
  { value: 'sick', label: 'Sick Leave', color: 'red', icon: 'heart' },
  { value: 'earned', label: 'Earned Leave', color: 'green', icon: 'calendar' },
];

export const LEAVE_STATUS = {
  pending: { label: 'Pending', color: 'warning', bgColor: 'bg-warning-50', textColor: 'text-warning-700' },
  approved: { label: 'Approved', color: 'success', bgColor: 'bg-success-50', textColor: 'text-success-700' },
  rejected: { label: 'Rejected', color: 'danger', bgColor: 'bg-danger-50', textColor: 'text-danger-700' },
  cancelled: { label: 'Cancelled', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
};

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Food',
  'Accommodation',
  'Office Supplies',
  'Others',
];

export const ROLES = {
  employee: 'employee',
  manager: 'manager',
  admin: 'admin',
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];