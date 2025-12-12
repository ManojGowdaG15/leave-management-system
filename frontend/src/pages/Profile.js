import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword } from '../services/authService';
import { getLeaveStats } from '../services/leaveService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
        gender: user.gender || '',
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await getLeaveStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field) => (event) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleProfileSubmit = async () => {
    try {
      setLoading(true);
      const response = await updateProfile(profileForm);
      
      if (response.data.success) {
        // Update user in context and localStorage
        const updatedUser = { ...user, ...profileForm };
        updateUser(updatedUser);
        
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'dd MMMM yyyy');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'hr': return 'warning';
      case 'manager': return 'info';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            My Profile
          </Typography>
          {tabValue === 0 && !editMode && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Profile Information" />
            <Tab label="Leave Balance" />
            <Tab label="Change Password" />
          </Tabs>
        </Box>

        {/* Profile Information Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Left Column - Profile Info */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto 20px',
                      bgcolor: 'primary.main',
                      fontSize: 40,
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  
                  <Typography variant="h5" gutterBottom>
                    {user?.name}
                  </Typography>
                  
                  <Chip
                    label={user?.role}
                    color={getRoleColor(user?.role)}
                    sx={{ mb: 2, textTransform: 'capitalize' }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user?.designation}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {user?.department}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Employee ID: {user?.employeeId}
                  </Typography>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Joining Date
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon fontSize="small" />
                      {formatDate(user?.joiningDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {user?.lastLogin ? formatDate(user?.lastLogin) : 'Never'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Chip
                      label={user?.isActive ? 'Active' : 'Inactive'}
                      color={user?.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Form */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Personal Information
                  </Typography>
                  
                  {editMode ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={profileForm.name}
                          onChange={handleProfileChange('name')}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={user?.email}
                          margin="normal"
                          disabled
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Number"
                          value={profileForm.contactNumber}
                          onChange={handleProfileChange('contactNumber')}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileChange('dateOfBirth')}
                          margin="normal"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Gender"
                          value={profileForm.gender}
                          onChange={handleProfileChange('gender')}
                          margin="normal"
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value=""></option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Address"
                          value={profileForm.address}
                          onChange={handleProfileChange('address')}
                          margin="normal"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleProfileSubmit}
                            disabled={loading}
                            startIcon={<SaveIcon />}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditMode(false);
                              // Reset form
                              setProfileForm({
                                name: user.name || '',
                                contactNumber: user.contactNumber || '',
                                address: user.address || '',
                                dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'yyyy-MM-dd') : '',
                                gender: user.gender || '',
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <EmailIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 3 }}>
                          {user?.email}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <PhoneIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                          Contact Number
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 3 }}>
                          {user?.contactNumber || 'Not set'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <CakeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                          Date of Birth
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 3 }}>
                          {formatDate(user?.dateOfBirth)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <PersonIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                          Gender
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 3 }}>
                          {user?.gender || 'Not set'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <LocationIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                          Address
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 3 }}>
                          {user?.address || 'Not set'}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
              
              {/* Employment Details */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon /> Employment Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID
                      </Typography>
                      <Typography variant="body1">
                        {user?.employeeId}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Designation
                      </Typography>
                      <Typography variant="body1">
                        {user?.designation}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {user?.department}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Joining Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(user?.joiningDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Leave Balance Tab */}
        {tabValue === 1 && stats && (
          <Grid container spacing={3}>
            {/* Overall Leave Balance */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overall Leave Balance
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary">
                          {stats?.userStats?.remainingLeaves || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remaining Leaves
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stats?.userStats?.remainingLeaves / stats?.userStats?.totalLeaves) * 100 || 0} 
                          sx={{ mt: 2, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3">
                          {stats?.userStats?.leavesTaken || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Leaves Taken
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stats?.userStats?.leavesTaken / stats?.userStats?.totalLeaves) * 100 || 0} 
                          color="warning"
                          sx={{ mt: 2, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3">
                          {stats?.userStats?.totalLeaves || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Leaves
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={100} 
                          color="info"
                          sx={{ mt: 2, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Leave Balance */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Casual Leave
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary">
                      {stats?.userStats?.casualLeaves?.remaining || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining out of {stats?.userStats?.casualLeaves?.total || 0}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats?.userStats?.casualLeaves?.remaining / stats?.userStats?.casualLeaves?.total) * 100 || 0} 
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {stats?.userStats?.casualLeaves?.taken || 0} days taken
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sick Leave
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary">
                      {stats?.userStats?.sickLeaves?.remaining || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining out of {stats?.userStats?.sickLeaves?.total || 0}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats?.userStats?.sickLeaves?.remaining / stats?.userStats?.sickLeaves?.total) * 100 || 0} 
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {stats?.userStats?.sickLeaves?.taken || 0} days taken
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Earned Leave
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary">
                      {stats?.userStats?.earnedLeaves?.remaining || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining out of {stats?.userStats?.earnedLeaves?.total || 0}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats?.userStats?.earnedLeaves?.remaining / stats?.userStats?.earnedLeaves?.total) * 100 || 0} 
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    {stats?.userStats?.earnedLeaves?.taken || 0} days taken
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Change Password Tab */}
        {tabValue === 2 && (
          <Grid container justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon /> Change Password
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Your password must be at least 6 characters long.
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange('currentPassword')}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange('newPassword')}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange('confirmPassword')}
                        margin="normal"
                        error={passwordForm.newPassword !== passwordForm.confirmPassword}
                        helperText={passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handlePasswordSubmit}
                          disabled={loading || 
                            !passwordForm.currentPassword || 
                            !passwordForm.newPassword || 
                            !passwordForm.confirmPassword ||
                            passwordForm.newPassword !== passwordForm.confirmPassword}
                          startIcon={<SaveIcon />}
                        >
                          Change Password
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;