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
  IconButton,
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
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { getLeaveStats, getUpcomingLeaves } from '../services/leaveService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, upcomingResponse] = await Promise.all([
        getLeaveStats(),
        getUpcomingLeaves(),
      ]);
      
      setStats(statsResponse.data.data);
      setUpcomingLeaves(upcomingResponse.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.name}!
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
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
                {stats?.userStats?.totalLeaves || 0}
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
                {stats?.userStats?.leavesTaken || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats?.userStats?.leavesTaken / stats?.userStats?.totalLeaves) * 100 || 0} 
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
                {stats?.userStats?.remainingLeaves || 0}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats?.userStats?.remainingLeaves / stats?.userStats?.totalLeaves) * 100 || 0} 
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
                {stats?.userStats?.casualLeaves?.remaining || 0} / {stats?.userStats?.casualLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats?.userStats?.casualLeaves?.remaining / stats?.userStats?.casualLeaves?.total) * 100 || 0} 
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
                {stats?.userStats?.sickLeaves?.remaining || 0} / {stats?.userStats?.sickLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats?.userStats?.sickLeaves?.remaining / stats?.userStats?.sickLeaves?.total) * 100 || 0} 
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
                {stats?.userStats?.earnedLeaves?.remaining || 0} / {stats?.userStats?.earnedLeaves?.total || 0}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats?.userStats?.earnedLeaves?.remaining / stats?.userStats?.earnedLeaves?.total) * 100 || 0} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Leaves Table */}
      {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager') && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Upcoming Team Leaves
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/approvals')}
            >
              View All
            </Button>
          </Box>
          {upcomingLeaves.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingLeaves.slice(0, 5).map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{leave.user?.name}</TableCell>
                      <TableCell>{leave.user?.department}</TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>
                        {format(new Date(leave.startDate), 'dd MMM')} - {format(new Date(leave.endDate), 'dd MMM')}
                      </TableCell>
                      <TableCell>{leave.numberOfDays} days</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(leave.status)}
                          label={leave.status}
                          size="small"
                          color={getStatusColor(leave.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No upcoming leaves
            </Typography>
          )}
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
            onClick={fetchDashboardData}
            sx={{ py: 1.5 }}
          >
            Refresh Data
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;