import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { dashboardService } from '../../services/dashboardService'; // Import new service

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the simple dashboard service
      const response = await dashboardService.getSimpleDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback to user data from context
      if (user) {
        setDashboardData({
          user: user,
          leaveStats: { approved: 0, pending: 0, rejected: 0, total: 0 },
          recentLeaves: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon fontSize="small" />;
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'rejected': return <CancelIcon fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Typography variant="h6">No dashboard data available</Typography>
        <Button onClick={fetchDashboardData} variant="outlined">
          Retry
        </Button>
      </Box>
    );
  }

  const { user: userData, leaveStats, recentLeaves } = dashboardData;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome back, {userData.name}!
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Leave Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Leaves
              </Typography>
              <Typography variant="h4">
                {userData.totalLeaves || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Leaves Taken
              </Typography>
              <Typography variant="h4">
                {userData.leavesTaken || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(userData.leavesTaken / (userData.totalLeaves || 1)) * 100 || 0} 
                color="warning"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Remaining Leaves
              </Typography>
              <Typography variant="h4" color="primary">
                {userData.remainingLeaves || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(userData.remainingLeaves / (userData.totalLeaves || 1)) * 100 || 0} 
                color="success"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/apply-leave')}
              >
                Apply Leave
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Leave Balance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Casual Leave
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Remaining:</Typography>
              <Typography variant="h6">
                {userData.casualLeaves?.remaining || 0} / {userData.casualLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(userData.casualLeaves?.remaining / (userData.casualLeaves?.total || 1)) * 100 || 0} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sick Leave
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Remaining:</Typography>
              <Typography variant="h6">
                {userData.sickLeaves?.remaining || 0} / {userData.sickLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(userData.sickLeaves?.remaining / (userData.sickLeaves?.total || 1)) * 100 || 0} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Earned Leave
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Remaining:</Typography>
              <Typography variant="h6">
                {userData.earnedLeaves?.remaining || 0} / {userData.earnedLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(userData.earnedLeaves?.remaining / (userData.earnedLeaves?.total || 1)) * 100 || 0} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Leaves Table */}
      {recentLeaves && recentLeaves.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Leave Applications
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentLeaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>
                      {format(new Date(leave.startDate), 'dd MMM')} - {format(new Date(leave.endDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>{leave.numberOfDays} day(s)</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(leave.status)}
                        label={leave.status}
                        size="small"
                        color={getStatusColor(leave.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(leave.appliedOn), 'dd MMM yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Quick Actions */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<EventIcon />}
            onClick={() => navigate('/apply-leave')}
            sx={{ py: 1.5 }}
          >
            Apply Leave
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<PendingIcon />}
            onClick={() => navigate('/my-leaves')}
            sx={{ py: 1.5 }}
          >
            My Leaves
          </Button>
        </Grid>
        {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager') && (
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CheckCircleIcon />}
              onClick={() => navigate('/approvals')}
              sx={{ py: 1.5 }}
            >
              Approvals
            </Button>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ py: 1.5 }}
          >
            Refresh Data
          </Button>
        </Grid>
      </Grid>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
          <Typography variant="caption" color="text.secondary">
            Debug: User role: {userData.role} | Data loaded: {dashboardData ? 'Yes' : 'No'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;