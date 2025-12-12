import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authAPI = {
    register: (userData) => API.post('/auth/register', userData),
    login: (credentials) => API.post('/auth/login', credentials),
};

// Leave services
export const leaveAPI = {
    applyLeave: (data) => API.post('/leave/apply', data),
    getMyApplications: () => API.get('/leave/my-applications'),
    getLeaveBalance: () => API.get('/leave/balance'),
    cancelApplication: (id) => API.put(`/leave/cancel/${id}`),
    getTeamRequests: () => API.get('/leave/team-requests'),
    approveLeave: (id, data) => API.put(`/leave/approve/${id}`, data),
    getTeamCalendar: () => API.get('/leave/team-calendar'),
};

// Dashboard services
export const dashboardAPI = {
    getEmployeeDashboard: () => API.get('/dashboard/employee'),
    getManagerDashboard: () => API.get('/dashboard/manager'),
};

export default API;