// Create folder: mkdir src/utils
// Then create this file: touch src/utils/helpers.js

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateLeaveDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' },
  };
  
  return statusConfig[status] || statusConfig.pending;
};

export const getLeaveTypeBadge = (type) => {
  const typeConfig = {
    casual: { color: 'bg-blue-100 text-blue-800', text: 'Casual' },
    sick: { color: 'bg-green-100 text-green-800', text: 'Sick' },
    earned: { color: 'bg-purple-100 text-purple-800', text: 'Earned' },
  };
  
  return typeConfig[type] || { color: 'bg-gray-100 text-gray-800', text: type };
};