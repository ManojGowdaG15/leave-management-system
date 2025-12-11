export const validateLogin = (email, password) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateLeaveApplication = (formData) => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!formData.startDate) {
    errors.startDate = 'Start date is required';
  } else if (new Date(formData.startDate) < today) {
    errors.startDate = 'Start date cannot be in the past';
  }

  if (!formData.endDate) {
    errors.endDate = 'End date is required';
  } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
    errors.endDate = 'End date must be after start date';
  }

  if (!formData.leaveType) {
    errors.leaveType = 'Leave type is required';
  }

  if (!formData.reason?.trim()) {
    errors.reason = 'Reason is required';
  } else if (formData.reason.length > 500) {
    errors.reason = 'Reason cannot exceed 500 characters';
  }

  return errors;
};

export const validateExpense = (formData) => {
  const errors = {};
  const today = new Date();

  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.expenseDate) {
    errors.expenseDate = 'Expense date is required';
  } else if (new Date(formData.expenseDate) > today) {
    errors.expenseDate = 'Expense date cannot be in the future';
  }

  return errors;
};