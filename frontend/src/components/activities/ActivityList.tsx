// frontend/src/components/activities/ActivityList.tsx
// List of activities with filter options

// Understanding: This component fetches and displays a paginated, filterable list of activities from the API.
// Plan:
//   Step 1: Import dependencies and define constants.
//   Step 2: Define filter state with useState.
//   Step 3: Fetch activities via useActivities(filters).
//   Step 4: Render filter controls (type, start/end dates).
//   Step 5: Show loading skeleton or error message.
//   Step 6: Render table rows for returned activities.
//   Step 7: Provide edit/delete actions (useDeleteActivity).
//   Step 8: Handle pagination control (limit, offset).

import React, { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Skeleton,
  TextField,
  MenuItem,
  Grid,
  Pagination,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useActivities, useDeleteActivity, useActivityTypes } from '../../hooks/useActivities';
import { ActivityFilterParams } from '../../services/activityService';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

// Extended filter state that includes UI state for filters
interface FilterState extends ActivityFilterParams {
  showFilters?: boolean;
}

interface ActivityFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setApiFilters: React.Dispatch<React.SetStateAction<ActivityFilterParams>>;
  activityTypes: string[];
  showFilters: boolean;
  handleClearFilters: () => void;
}

// Extracted filter component
const ActivityFilters: React.FC<ActivityFiltersProps> = ({ 
  filters, 
  setFilters,
  setApiFilters,
  activityTypes, 
  showFilters,
  handleClearFilters 
}) => {
  // Create debounced filter update function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateApiFilters = useCallback(
    debounce((newFilters: ActivityFilterParams) => {
      setApiFilters(newFilters);
    }, 500),
    [setApiFilters]
  );

  // Update local UI state immediately, but debounce API requests
  useEffect(() => {
    const apiFilters: ActivityFilterParams = {
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit,
      offset: filters.offset
    };
    debouncedUpdateApiFilters(apiFilters);
  }, [filters, debouncedUpdateApiFilters]);
  
  // Handle filter changes
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      type: event.target.value || undefined,
      offset: 0 // Reset pagination when changing filters
    }));
  };
  
  // Handle Start Date change from DatePicker
  const handleStartDateChange = (date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      startDate: date ? date.toISOString() : undefined,
      offset: 0
    }));
  };
  
  // Handle End Date change from DatePicker
  const handleEndDateChange = (date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      endDate: date ? date.toISOString() : undefined,
      offset: 0
    }));
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Activity History</Typography>
        
        <Box>
          <Button 
            startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
            onClick={() => setFilters(prev => ({ ...prev, showFilters: !showFilters }))}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {showFilters && (
            <Button 
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!filters.type && !filters.startDate && !filters.endDate}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>
      
      {showFilters && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Activity Type"
              value={filters.type || ''}
              onChange={handleTypeChange}
              fullWidth
            >
              <MenuItem value="">All Types</MenuItem>
              {activityTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(newValue) => handleStartDateChange(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}  
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(newValue) => handleEndDateChange(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}  
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      )}
      
      {/* Active filters display */}
      {(filters.type || filters.startDate || filters.endDate) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Active filters:</Typography>
          
          {filters.type && (
            <Chip 
              label={`Type: ${filters.type}`} 
              onDelete={() => setFilters(prev => ({ ...prev, type: undefined, offset: 0 }))}
              size="small"
            />
          )}
          
          {filters.startDate && (
            <Chip 
              label={`From: ${format(new Date(filters.startDate), 'MMM d, yyyy')}`}
              onDelete={() => setFilters(prev => ({ ...prev, startDate: undefined, offset: 0 }))}
              size="small"
            />
          )}
          
          {filters.endDate && (
            <Chip 
              label={`To: ${format(new Date(filters.endDate), 'MMM d, yyyy')}`}
              onDelete={() => setFilters(prev => ({ ...prev, endDate: undefined, offset: 0 }))}
              size="small"
            />
          )}
        </Box>
      )}
    </>
  );
};

const ActivityList: React.FC = () => {
  const navigate = useNavigate();
  const activityTypes = useActivityTypes();
  const deleteActivity = useDeleteActivity();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  
  // Filter state for UI
  const [filters, setFilters] = useState<FilterState>({
    limit: 10,
    offset: 0,
    showFilters: false
  });
  
  // Add separate state for debounced API calls
  const [apiFilters, setApiFilters] = useState<ActivityFilterParams>({
    limit: 10,
    offset: 0
  });
  
  // Create debounced filter update function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateFilters = useCallback(
    debounce((newFilters: ActivityFilterParams) => {
      setApiFilters(newFilters);
    }, 500),
    []
  );

  // Update API filters when UI filters change
  useEffect(() => {
    const newApiFilters: ActivityFilterParams = {
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: filters.limit,
      offset: filters.offset
    };
    debouncedUpdateFilters(newApiFilters);
  }, [filters, debouncedUpdateFilters]);
  
  // Use apiFilters for data fetching instead of direct filters
  const { data, isLoading, isError, error } = useActivities(apiFilters);
  
  const handleClearFilters = () => {
    setFilters({
      limit: 10,
      offset: 0,
      showFilters: filters.showFilters
    });
  };
  
  // Handle pagination
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (page - 1) * prev.limit!
    }));
  };
  
  // Current page calculation
  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1;
  
  // Total pages calculation
  const totalPages = data?.total ? Math.ceil(data.total / (filters.limit || 10)) : 0;
  
  // Handle edit/delete
  const handleEdit = (id: string) => {
    navigate(`/activities/edit/${id}`);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (id: string) => {
    setActivityToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      deleteActivity.mutate(activityToDelete);
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {/* Filter section */}
      <ActivityFilters 
        filters={filters}
        setFilters={setFilters}
        setApiFilters={setApiFilters}
        activityTypes={activityTypes}
        showFilters={filters.showFilters || false}
        handleClearFilters={handleClearFilters}
      />
      
      {/* Step 5: Display error message if data fetch fails. */}
      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading activities: {(error as Error).message}
        </Typography>
      )}
      
      {/* Step 5: Show loading skeleton during data fetch. */}
      {isLoading && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Calories</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Step 6: Render table rows for each activity in data.items. */}
      {!isLoading && data && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Duration (mins)</TableCell>
                  <TableCell>Calories</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No activities found. Try changing your filters or add a new activity.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {format(new Date(activity.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell>{activity.duration}</TableCell>
                      <TableCell>{activity.calories}</TableCell>
                      <TableCell>
                        {activity.notes ? (
                          activity.notes.length > 50 ? (
                            <Tooltip title={activity.notes}>
                              <span>{activity.notes.substring(0, 50)}...</span>
                            </Tooltip>
                          ) : activity.notes
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No notes
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(activity.id)}
                          aria-label="Edit activity"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(activity.id)}
                          aria-label="Delete activity"
                          color="error"
                          disabled={deleteActivity.isPending}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Step 8: Render pagination controls (page number, first/last navigation). */}
          {data.total > 0 && (
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                shape="rounded"
              />
            </Stack>
          )}
        </>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Activity
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this activity? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ActivityList; 