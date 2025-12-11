const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validateLeaveDates = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < today) {
        return { isValid: false, message: 'Start date cannot be in the past' };
    }
    
    if (end < start) {
        return { isValid: false, message: 'End date must be after start date' };
    }
    
    const maxDays = 30;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays > maxDays) {
        return { isValid: false, message: `Leave cannot exceed ${maxDays} days` };
    }
    
    return { isValid: true, days: diffDays };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateLeaveDates,
};