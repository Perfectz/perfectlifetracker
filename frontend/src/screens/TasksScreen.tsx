/**
 * frontend/src/screens/TasksScreen.tsx
 * Tasks and todo management screen (web version)
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Divider,
  Button,
  Tabs,
  Tab,
  Chip,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Star as StarIcon,
  PriorityHigh as PriorityHighIcon,
  Event as EventIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { terraColors } from '../theme';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  completeTask,
  getTasksByStatus,
  type Task 
} from '../services/taskService';

const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      let updatedTask: Task;
      if (task.status === 'completed') {
        // Mark as pending
        updatedTask = await updateTask(taskId, { status: 'pending' });
      } else {
        // Mark as completed
        updatedTask = await completeTask(taskId);
      }

      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );
      
      setSnackbarMessage(
        updatedTask.status === 'completed' ? 'Task completed!' : 'Task marked as pending'
      );
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'high') return task.priority === 'high' && task.status === 'pending';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your tasks...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: terraColors.pearl,
        p: 2,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 2 }}>
          Tasks
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Task Summary Card */}
        <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Task Overview
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>
                {tasks.filter(t => t.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>
                Pending
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>
                {tasks.filter(t => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>
                Completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>
                {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                High Priority
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={filter}
            onChange={(e, newValue) => setFilter(newValue)}
            aria-label="Task filters"
          >
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Completed" value="completed" />
            <Tab label="High Priority" value="high" />
          </Tabs>
        </Box>

        {/* Task List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Paper sx={{ borderRadius: 2 }}>
            <List>
              {filteredTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        onChange={() => handleToggleComplete(task.id)}
                        checked={task.status === 'completed'}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={
                          <CheckCircleOutline sx={{ color: terraColors.tropicalRain }} />
                        }
                      />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      {task.priority === 'high' ? (
                        <PriorityHighIcon color="error" />
                      ) : task.priority === 'medium' ? (
                        <PriorityHighIcon color="warning" />
                      ) : null}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {task.description && (
                            <Typography variant="body2" sx={{ mb: 0.5, width: '100%' }}>
                              {task.description}
                            </Typography>
                          )}
                          {task.dueDate && (
                            <Chip
                              icon={<EventIcon fontSize="small" />}
                              label={task.dueDate}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {task.category && (
                            <Chip
                              icon={<CategoryIcon fontSize="small" />}
                              label={task.category}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {task.tags &&
                            task.tags.map(tag => (
                              <Chip
                                key={tag}
                                icon={<TagIcon fontSize="small" />}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                      sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
                    />
                  </ListItem>
                  {index < filteredTasks.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {filteredTasks.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary={
                      filter === 'all' 
                        ? 'No tasks yet. Create your first task!'
                        : `No ${filter} tasks found.`
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        {/* Smart Suggestions */}
        {tasks.length > 0 && (
          <Paper sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: terraColors.pearl }}>
            <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
              Smart Suggestions
            </Typography>
            <Typography sx={{ color: terraColors.maastrichtBlue, mb: 1 }}>
              You have {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}{' '}
              high-priority tasks due soon. Consider focusing on them first.
            </Typography>
            <Button variant="text" sx={{ color: terraColors.tropicalRain, alignSelf: 'flex-start' }}>
              Optimize My Schedule
            </Button>
          </Paper>
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: terraColors.tropicalRain }}
        onClick={() => {
          // TODO: Open add task dialog
          setSnackbarMessage('Add task functionality coming soon!');
          setSnackbarOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Success Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TasksScreen;
