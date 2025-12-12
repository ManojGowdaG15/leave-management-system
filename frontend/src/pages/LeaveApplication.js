import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Event as EventIcon,
  Send as SendIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { applyLeave } from '../services/leaveService';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Leave Details', 'Review & Submit'];

const LeaveApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayType: 'first-half',
    contactDuringLeave: user?.contactNumber || '',
  });

  // Calculate number of days
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return formData.isHalfDay ? 0.5 : diffDays + 1;
  };

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) newErrors.endDate = 'End date must be after start date';
      
      // Check if start date is in past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) newErrors.startDate = 'Start date cannot be in past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && validateStep1()) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const leaveData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        numberOfDays: calculateDays(),
      };

      const response = await applyLeave(leaveData);
      
      if (response.data.success) {
        toast.success('Leave application submitted successfully!');
        navigate('/my-leaves');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeDescription = (type) => {
    const descriptions = {
      'Casual': 'For personal or casual work',
      'Sick': 'For medical reasons (documentation may be required)',
      'Earned': 'Annual leave or privilege leave',
      'Maternity': 'For pregnant employees',
      'Paternity': 'For new fathers',
      'Bereavement': 'For family bereavement',
      'Compensatory': 'Compensatory off',
      'Unpaid': 'Leave without pay',
    };
    return descriptions[type] || '';
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon /> Apply for Leave
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leaveType}
                  onChange={handleChange('leaveType')}
                  label="Leave Type"
                  error={!!errors.leaveType}
                >
                  <MenuItem value="Casual">Casual Leave</MenuItem>
                  <MenuItem value="Sick">Sick Leave</MenuItem>
                  <MenuItem value="Earned">Earned Leave</MenuItem>
                  <MenuItem value="Maternity">Maternity Leave</MenuItem>
                  <MenuItem value="Paternity">Paternity Leave</MenuItem>
                  <MenuItem value="Bereavement">Bereavement Leave</MenuItem>
                  <MenuItem value="Compensatory">Compensatory Off</MenuItem>
                  <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                </Select>
                {errors.leaveType && (
                  <Typography color="error" variant="caption">{errors.leaveType}</Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getLeaveTypeDescription(formData.leaveType)}
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isHalfDay}
                    onChange={(e) => handleChange('isHalfDay')(e.target.checked)}
                  />
                }
                label="Half Day Leave"
              />
              {formData.isHalfDay && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Half Day Session</InputLabel>
                  <Select
                    value={formData.halfDayType}
                    onChange={handleChange('halfDayType')}
                    label="Half Day Session"
                  >
                    <MenuItem value="first-half">First Half (9 AM - 1 PM)</MenuItem>
                    <MenuItem value="second-half">Second Half (1 PM - 6 PM)</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                margin="normal"
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: formData.endDate || undefined }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                margin="normal"
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.startDate || undefined }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason for Leave"
                value={formData.reason}
                onChange={handleChange('reason')}
                margin="normal"
                error={!!errors.reason}
                helperText={errors.reason || 'Please provide a detailed reason for your leave'}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact During Leave"
                value={formData.contactDuringLeave}
                onChange={handleChange('contactDuringLeave')}
                margin="normal"
                placeholder="Phone number where you can be reached"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <CalculateIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Leave Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Number of Days
                    </Typography>
                    <Typography variant="h6">
                      {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Leave Type
                    </Typography>
                    <Typography variant="h6">
                      {formData.leaveType}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Leave Application
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Leave Type</Typography>
                  <Typography variant="body1">{formData.leaveType}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">
                    {new Date(formData.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">
                    {new Date(formData.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">
                    {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                    {formData.isHalfDay && ` (Half Day - ${formData.halfDayType})`}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>{formData.reason}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Contact During Leave</Typography>
                  <Typography variant="body1">{formData.contactDuringLeave}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              Your leave application will be sent to your manager for approval. 
              You can track the status in "My Leaves" section.
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeaveApplication;