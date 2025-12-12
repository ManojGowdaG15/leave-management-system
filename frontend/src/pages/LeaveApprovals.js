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
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Pagination,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getAllLeaves, approveLeave, getLeaveById } from '../services/leaveService';

const LeaveApprovals = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    department: '',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchLeaves();
  }, [filters, tabValue]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      // Set status based on tab
      if (tabValue === 0) params.status = 'pending';
      else if (tabValue === 1) params.status = 'approved';
      else if (tabValue === 2) params.status = 'rejected';
      
      if (!params.department) delete params.department;

      const response = await getAllLeaves(params);
      setLeaves(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load leave approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  const handleViewLeave = async (leaveId) => {
    try {
      const response = await getLeaveById(leaveId);
      setLeaveDetails(response.data.data);
      setViewDialog(true);
    } catch (error) {
      toast.error('Failed to load leave details');
    }
  };

  const handleActionClick = (leaveId, type) => {
    setSelectedLeave(leaveId);
    setActionType(type);
    setComments('');
    setActionDialog(true);
  };

  const handleActionSubmit = async () => {
    try {
      await approveLeave(selectedLeave, actionType, comments);
      
      toast.success(`Leave ${actionType}d successfully`);
      setActionDialog(false);
      fetchLeaves();
      
      // Refresh dashboard data if needed
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} leave`);
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
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const getDepartments = () => {
    return ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'];
  };

  const canApproveLeave = (leave) => {
    if (user.role === 'admin' || user.role === 'hr') return true;
    if (user.role === 'manager' && leave.user?.department === user.department) return true;
    return false;
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Leave Approvals
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLeaves}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize="small" />
                  Pending
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" />
                  Approved
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelIcon fontSize="small" />
                  Rejected
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon fontSize="small" /> Filters
          </Typography>
          <Grid container spacing={2}>
            {(user.role === 'admin' || user.role === 'hr') && (
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    onChange={handleFilterChange('department')}
                    label="Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {getDepartments().map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Show per page</InputLabel>
                <Select
                  value={filters.limit}
                  onChange={handleFilterChange('limit')}
                  label="Show per page"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Leaves Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : leaves.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary">
              No leave applications found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Applied On</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id} hover>
                      <TableCell>
                        <Typography variant="body2">{leave.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.user?.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {leave.user?.department}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{leave.leaveType}</Typography>
                        {leave.isHalfDay && (
                          <Typography variant="caption" color="text.secondary">
                            Half Day
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </TableCell>
                      <TableCell>
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </TableCell>
                      <TableCell>
                        {formatDate(leave.appliedOn)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewLeave(leave._id)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {tabValue === 0 && canApproveLeave(leave) && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleActionClick(leave._id, 'approve')}
                                title="Approve Leave"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleActionClick(leave._id, 'reject')}
                                title="Reject Leave"
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={filters.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* View Leave Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Application Details</DialogTitle>
        <DialogContent>
          {leaveDetails && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Employee</Typography>
                <Typography variant="body1">
                  {leaveDetails.user?.name} ({leaveDetails.user?.employeeId})
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{leaveDetails.user?.department}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Leave Type</Typography>
                <Typography variant="body1">{leaveDetails.leaveType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1">
                  <Chip
                    label={leaveDetails.status}
                    color={getStatusColor(leaveDetails.status)}
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1">{formatDate(leaveDetails.startDate)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">End Date</Typography>
                <Typography variant="body1">{formatDate(leaveDetails.endDate)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Duration</Typography>
                <Typography variant="body1">
                  {leaveDetails.numberOfDays} days
                  {leaveDetails.isHalfDay && ` (Half Day - ${leaveDetails.halfDayType})`}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Applied On</Typography>
                <Typography variant="body1">{formatDate(leaveDetails.appliedOn)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Reason</Typography>
                <Typography variant="body1" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {leaveDetails.reason}
                </Typography>
              </Grid>
              {leaveDetails.contactDuringLeave && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Contact During Leave</Typography>
                  <Typography variant="body1">{leaveDetails.contactDuringLeave}</Typography>
                </Grid>
              )}
              {leaveDetails.approvedBy && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Approved By</Typography>
                  <Typography variant="body1">
                    {leaveDetails.approvedBy.name} ({leaveDetails.approvedBy.email})
                  </Typography>
                </Grid>
              )}
              {leaveDetails.rejectionReason && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Rejection Reason</Typography>
                  <Typography variant="body1" color="error.main">
                    {leaveDetails.rejectionReason}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        </DialogTitle>
        <DialogContent>
          <Alert severity={actionType === 'approve' ? 'success' : 'warning'} sx={{ mb: 2 }}>
            You are about to {actionType} this leave application.
          </Alert>
          
          {actionType === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Please provide a reason for rejection"
              required
            />
          )}
          
          {actionType === 'approve' && (
            <TextField
              autoFocus
              margin="dense"
              label="Comments (Optional)"
              type="text"
              fullWidth
              multiline
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any comments for the employee"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleActionSubmit} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={actionType === 'reject' && !comments.trim()}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveApprovals;