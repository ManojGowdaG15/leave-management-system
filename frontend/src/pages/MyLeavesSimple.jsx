import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Refresh as RefreshIcon, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const MyLeavesSimple = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    casual: { taken: 0, remaining: 0 },
    sick: { taken: 0, remaining: 0 },
    earned: { taken: 0, remaining: 0 }
  });

  useEffect(() => {
    fetchLeaves();
    
    // Set leave summary from user data
    if (user) {
      setLeaveSummary({
        casual: user.casualLeaves || { taken: 0, remaining: 12 },
        sick: user.sickLeaves || { taken: 0, remaining: 10 },
        earned: user.earnedLeaves || { taken: 0, remaining: 15 }
      });
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/my-leaves');
      
      if (response.data.success) {
        setLeaves(response.data.data || []);
      } else {
        toast.error('Failed to load leaves');
      }
    } catch (error) {
      console.error('Fetch leaves error:', error);
      toast.error('Error loading leaves');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Leaves
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLeaves}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={() => navigate('/apply-leave')}
            >
              Apply Leave
            </Button>
          </Box>
        </Box>

        {/* Leave Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="primary" gutterBottom>
                Casual Leave
              </Typography>
              <Typography variant="h5">
                {leaveSummary.casual.taken} taken / {leaveSummary.casual.remaining} remaining
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="primary" gutterBottom>
                Sick Leave
              </Typography>
              <Typography variant="h5">
                {leaveSummary.sick.taken} taken / {leaveSummary.sick.remaining} remaining
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="primary" gutterBottom>
                Earned Leave
              </Typography>
              <Typography variant="h5">
                {leaveSummary.earned.taken} taken / {leaveSummary.earned.remaining} remaining
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Leaves Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Leave History
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : leaves.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{formatDate(leave.startDate)}</TableCell>
                      <TableCell>{formatDate(leave.endDate)}</TableCell>
                      <TableCell>{leave.numberOfDays}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(leave.appliedOn)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No leave applications found. Click "Apply Leave" to submit your first request.
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default MyLeavesSimple;