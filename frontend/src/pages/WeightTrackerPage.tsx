/**
 * Page for logging and viewing weight entries with full CRUD operations
 */
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import {
  fetchWeightRecords,
  postWeightRecord,
  updateWeightRecord,
  deleteWeightRecord,
  WeightRecord
} from '../services/fitnessService';

interface EditData {
  id: string;
  date: string;
  weight: string;
}

const WeightTrackerPage: React.FC = () => {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Load existing records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchWeightRecords();
      // Sort records by date (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(sortedData);
    } catch (error) {
      console.error('Failed to load weight records', error);
      showMessage('Failed to load weight records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setSnackbarOpen(true);
  };

  // Handle form submission for new entries
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !date) {
      showMessage('Please enter both date and weight', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await postWeightRecord({ date, weight: Number(weight) });
      setWeight('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      await loadRecords();
      showMessage('Weight entry added successfully!', 'success');
    } catch (error) {
      console.error('Failed to save weight record', error);
      showMessage('Failed to save weight record', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (record: WeightRecord) => {
    setEditData({
      id: record.id,
      date: record.date.split('T')[0], // Extract date part
      weight: record.value.toString()
    });
    setEditDialogOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!editData || !editData.weight || !editData.date) {
      showMessage('Please enter both date and weight', 'error');
      return;
    }

    try {
      setLoading(true);
      await updateWeightRecord(editData.id, { 
        date: editData.date, 
        weight: Number(editData.weight) 
      });
      setEditDialogOpen(false);
      setEditData(null);
      await loadRecords();
      showMessage('Weight entry updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update weight record', error);
      showMessage('Failed to update weight record', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteWeightRecord(id);
      await loadRecords();
      showMessage('Weight entry deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete weight record', error);
      showMessage('Failed to delete weight record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        Weight Tracker
      </Typography>
      
      {/* Add New Entry Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Weight Entry
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
        >
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Weight (lbs)"
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            inputProps={{ step: 0.1, min: 0 }}
            required
            sx={{ minWidth: 120 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<Add />}
            disabled={loading}
          >
            Add Entry
          </Button>
        </Box>
      </Paper>

      {/* Records Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Weight History ({records.length} entries)
        </Typography>
        
        {records.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No weight entries yet. Add your first entry above!
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Weight</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record: WeightRecord) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {record.value} {record.unit}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleEditClick(record)}
                      color="primary"
                      size="small"
                      disabled={loading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(record.id)}
                      color="error"
                      size="small"
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Weight Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={editData?.date || ''}
              onChange={e => setEditData(prev => prev ? { ...prev, date: e.target.value } : null)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Weight (lbs)"
              type="number"
              value={editData?.weight || ''}
              onChange={e => setEditData(prev => prev ? { ...prev, weight: e.target.value } : null)}
              inputProps={{ step: 0.1, min: 0 }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={loading}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={messageType}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WeightTrackerPage; 