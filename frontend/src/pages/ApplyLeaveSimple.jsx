import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ApplyLeaveSimple = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState({
    casual: { total: 12, taken: 0, remaining: 12 },
    sick: { total: 10, taken: 0, remaining: 10 },
    earned: { total: 15, taken: 0, remaining: 15 }
  });
  
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: null,
    endDate: null,
    reason: '',
    numberOfDays: 1
  });

  // Load user leave balances
  useEffect(() => {
    if (user) {
      setLeaveBalances({
        casual: user.casualLeaves || { total: 12, taken: 0, remaining: 12 },
        sick: user.sickLeaves || { total: 10, taken: 0, remaining: 10 },
        earned: user.earnedLeaves || { total: 15, taken: 0, remaining: 15 }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, numberOfDays: diffDays });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check leave balance
    const selectedLeaveType = formData.leaveType.toLowerCase();
    const availableLeaves = leaveBalances[selectedLeaveType]?.remaining || 0;
    
    if (formData.numberOfDays > availableLeaves) {
      toast.error(`Insufficient ${formData.leaveType} leave balance. Available: ${availableLeaves} days`);
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/leaves', {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        numberOfDays: formData.numberOfDays
      });

      if (response.data.success) {
        toast.success('Leave application submitted successfully!');
        navigate('/my-leaves');
      } else {
        toast.error(response.data.message || 'Failed to apply leave');
      }
    } catch (error) {
      console.error('Apply leave error:', error);
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLeaves = () => {
    switch (formData.leaveType) {
      case 'Casual':
        return leaveBalances.casual.remaining;
      case 'Sick':
        return leaveBalances.sick.remaining;
      case 'Earned':
        return leaveBalances.earned.remaining;
      default:
        return 0;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Apply Leave
        </Typography>
        
        {/* Leave Balance Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Casual Leave
                </Typography>
                <Typography variant="h5">
                  {leaveBalances.casual.remaining} / {leaveBalances.casual.total} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taken: {leaveBalances.casual.taken} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Sick Leave
                </Typography>
                <Typography variant="h5">
                  {leaveBalances.sick.remaining} / {leaveBalances.sick.total} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taken: {leaveBalances.sick.taken} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Earned Leave
                </Typography>
                <Typography variant="h5">
                  {leaveBalances.earned.remaining} / {leaveBalances.earned.total} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taken: {leaveBalances.earned.taken} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Application Form */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Leave Application Form
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Leave Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type *</InputLabel>
                  <Select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    label="Leave Type *"
                  >
                    <MenuItem value="Casual">Casual Leave</MenuItem>
                    <MenuItem value="Sick">Sick Leave</MenuItem>
                    <MenuItem value="Earned">Earned Leave</MenuItem>
                  </Select>
                </FormControl>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  Available {formData.leaveType} Leave: <strong>{getAvailableLeaves()} days</strong>
                </Alert>
              </Grid>
              
              {/* Number of Days */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Days"
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  inputProps={{ min: 0.5, step: 0.5 }}
                  helperText="Enter 0.5 for half day"
                />
              </Grid>
              
              {/* Dates */}
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date *"
                    value={formData.startDate}
                    onChange={(date) => {
                      setFormData({ ...formData, startDate: date });
                      if (formData.endDate) calculateDays();
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date *"
                    value={formData.endDate}
                    onChange={(date) => {
                      setFormData({ ...formData, endDate: date });
                      if (formData.startDate) calculateDays();
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={formData.startDate || new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Leave *"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Please provide details about your leave request..."
                />
              </Grid>
              
              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Submitting...' : 'Apply Leave'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Leave Policy Info */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Leave Policy Information
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Casual Leave:</strong> {leaveBalances.casual.total} days per year, can be taken for personal reasons.
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Sick Leave:</strong> {leaveBalances.sick.total} days per year, requires medical certificate for more than 2 days.
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Earned Leave:</strong> {leaveBalances.earned.total} days per year, accrued based on service period.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Note: Leave applications require manager approval. Please apply at least 2 days in advance.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ApplyLeaveSimple;