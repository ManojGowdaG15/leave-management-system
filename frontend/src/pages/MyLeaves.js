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
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getMyLeaves, cancelLeave, getLeaveById } from '../services/leaveService';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    year: new Date().getFullYear().toString(),
    month: '',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      if (!params.month) delete params.month;

      const response = await getMyLeaves(params);
      setLeaves(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
      page: 1, // Reset to first page when filter changes
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

  const handleCancelLeave = async () => {
    try {
      await cancelLeave(selectedLeave);
      toast.success('Leave cancelled successfully');
      setCancelDialog(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '⏳';
      case 'rejected': return '✗';
      case 'cancelled': return '⊝';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  };

  const getMonths = () => [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const exportToCSV = () => {
    const headers = ['Leave Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Applied On', 'Reason'];
    const csvData = leaves.map(leave => [
      leave.leaveType,
      formatDate(leave.startDate),
      formatDate(leave.endDate),
      `${leave.numberOfDays} days`,
      leave.status,
      formatDate(leave.appliedOn),
      leave.reason.substring(0, 50) + (leave.reason.length > 50 ? '...' : ''),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-leaves-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            My Leave Applications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLeaves}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon fontSize="small" /> Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select
                  value={filters.year}
                  onChange={handleFilterChange('year')}
                  label="Year"
                >
                  {getYears().map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={filters.month}
                  onChange={handleFilterChange('month')}
                  label="Month"
                >
                  {getMonths().map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              href="/apply-leave"
            >
              Apply for Leave
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
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
                        <Typography variant="body2">{leave.leaveType}</Typography>
                        {leave.isHalfDay && (
                          <Typography variant="caption" color="text.secondary">
                            Half Day ({leave.halfDayType})
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
                          label={`${getStatusIcon(leave.status)} ${leave.status}`}
                          color={getStatusColor(leave.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {leave.approvedBy && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            By: {leave.approvedBy?.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewLeave(leave._id)}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {(leave.status === 'pending' || leave.status === 'approved') && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedLeave(leave._id);
                              setCancelDialog(true);
                            }}
                            title="Cancel Leave"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        )}
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
        <DialogTitle>Leave Details</DialogTitle>
        <DialogContent>
          {leaveDetails && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    sx={{ textTransform: 'capitalize' }}
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
                  {leaveDetails.numberOfDays} {leaveDetails.numberOfDays === 1 ? 'day' : 'days'}
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

      {/* Cancel Leave Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Leave Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this leave application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>No</Button>
          <Button onClick={handleCancelLeave} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyLeaves;