const moment = require('moment');

const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY');
};

const formatDateTime = (date) => {
    return moment(date).format('DD MMM YYYY, hh:mm A');
};

const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
};

const getStatusColor = (status) => {
    switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'danger';
        case 'cancelled': return 'secondary';
        default: return 'info';
    }
};

module.exports = {
    formatDate,
    formatDateTime,
    calculateBusinessDays,
    getStatusColor,
};