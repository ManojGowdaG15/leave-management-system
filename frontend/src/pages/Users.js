import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers, updateUser } from '../services/userService';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    designation: '',
    isActive: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // Filter users based on current user role
      let filteredUsers = response.data.data || [];
      
      // HR can see all users except other HR and admin
      if (currentUser.role === 'hr') {
        filteredUsers = filteredUsers.filter(u => 
          u.role !== 'admin' && u.role !== 'hr'
        );
      }
      
      // Apply additional filters
      if (filters.department) {
        filteredUsers = filteredUsers.filter(u => 
          u.department === filters.department
        );
      }
      
      if (filters.role) {
        filteredUsers = filteredUsers.filter(u => 
          u.role === filters.role
        );
      }
      
      // Pagination
      const startIndex = (filters.page - 1) * filters.limit;
      const endIndex = startIndex + filters.limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
      setTotalPages(Math.ceil(filteredUsers.length / filters.limit));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentUser.role, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      isActive: user.isActive,
    });
    setEditDialog(true);
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setUserForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(selectedUser._id, userForm);
      toast.success('User updated successfully');
      setEditDialog(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
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

  const getDepartmentColor = (department) => {
    const colors = {
      'Engineering': 'primary',
      'HR': 'secondary',
      'Marketing': 'success',
      'Sales': 'warning',
      'Finance': 'info',
      'Operations': 'error',
      'IT': 'primary',
      'Administration': 'secondary',
    };
    return colors[department] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const getDepartments = () => {
    return ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'];
  };

  const getRoles = () => {
    if (currentUser.role === 'admin') {
      return ['admin', 'hr', 'manager', 'employee'];
    } else if (currentUser.role === 'hr') {
      return ['manager', 'employee'];
    }
    return [];
  };

  const canEditUser = (userToEdit) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'hr' && userToEdit.role !== 'admin' && userToEdit.role !== 'hr') {
      return true;
    }
    return false;
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            User Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  onChange={handleFilterChange('role')}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {getRoles().map(role => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
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

        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary">
              No users found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.employeeId}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.department}
                          color={getDepartmentColor(user.department)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.designation}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {canEditUser(user) && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditUser(user)}
                                title="Edit User"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={user.isActive}
                                    onChange={() => handleToggleStatus(user._id, user.isActive)}
                                    color="success"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
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

      {/* View User Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                <Typography variant="body1">{selectedUser.employeeId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Typography variant="body1">
                  <Chip
                    label={selectedUser.role}
                    color={getRoleColor(selectedUser.role)}
                    size="small"
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Department</Typography>
                <Typography variant="body1">
                  <Chip
                    label={selectedUser.department}
                    color={getDepartmentColor(selectedUser.department)}
                    size="small"
                    variant="outlined"
                  />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Designation</Typography>
                <Typography variant="body1">{selectedUser.designation}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Joining Date</Typography>
                <Typography variant="body1">{formatDate(selectedUser.joiningDate)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1">
                  <Chip
                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Leaves</Typography>
                <Typography variant="body1">{selectedUser.totalLeaves}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Leaves Taken</Typography>
                <Typography variant="body1">{selectedUser.leavesTaken}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Remaining Leaves</Typography>
                <Typography variant="body1" color="primary.main">
                  {selectedUser.remainingLeaves}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                <Typography variant="body1">
                  {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                </Typography>
              </Grid>
              
              {selectedUser.contactNumber && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                  <Typography variant="body1">{selectedUser.contactNumber}</Typography>
                </Grid>
              )}
              
              {selectedUser.address && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">{selectedUser.address}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={userForm.name}
                onChange={handleFormChange('name')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={userForm.email}
                onChange={handleFormChange('email')}
                margin="normal"
                type="email"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={handleFormChange('role')}
                  label="Role"
                >
                  {getRoles().map(role => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={userForm.department}
                  onChange={handleFormChange('department')}
                  label="Department"
                >
                  {getDepartments().map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={userForm.designation}
                onChange={handleFormChange('designation')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.isActive}
                    onChange={handleFormChange('isActive')}
                    color="success"
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;