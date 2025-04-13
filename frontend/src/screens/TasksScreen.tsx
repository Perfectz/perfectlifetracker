/**
 * frontend/src/screens/TasksScreen.tsx
 * Tasks and todo management screen (web version)
 */
import React, { useState } from 'react';
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
  Fab
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
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { terraColors } from '../theme';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MainTabParamList } from '../navigation/AppNavigator';

type TasksScreenProps = StackScreenProps<MainTabParamList, 'Tasks'>;

// Mock data for tasks
const mockTasks = [
  { id: '1', title: 'Complete project proposal', description: 'Finalize proposal for Q3 project', status: 'pending', priority: 'high', dueDate: '2024-08-15', category: 'Work', tags: ['Project X', 'Urgent'] },
  { id: '2', title: 'Schedule team meeting', description: 'Coordinate schedules for weekly sync', status: 'pending', priority: 'medium', dueDate: '2024-08-10', category: 'Work', tags: ['Team'] },
  { id: '3', title: 'Pay utility bills', description: 'Electricity and internet bills', status: 'pending', priority: 'medium', dueDate: '2024-08-12', category: 'Personal', tags: ['Finance'] },
  { id: '4', title: 'Buy groceries', description: 'Milk, eggs, bread, vegetables', status: 'completed', priority: 'low', dueDate: '2024-08-09', completedDate: '2024-08-09', category: 'Personal', tags: ['Shopping'] },
  { id: '5', title: 'Research vacation destinations', description: 'Look into options for winter break', status: 'pending', priority: 'low', dueDate: '2024-09-01', category: 'Personal', tags: ['Travel'] },
];

const TasksScreen: React.FC<TasksScreenProps> = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed', 'high'

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === 'pending' ? 'completed' : 'pending', 
            completedDate: task.status === 'pending' ? new Date().toISOString().split('T')[0] : undefined 
          } 
        : task
    ));
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
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ 
      flex: 1, 
      backgroundColor: terraColors.pearl,
      p: 2,
      position: 'relative', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" sx={{ color: terraColors.prussianBlue, mb: 2 }}>
          Tasks
        </Typography>

        {/* Task Summary Card */}
        <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Task Overview
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{tasks.filter(t => t.status === 'pending').length}</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Pending</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{tasks.filter(t => t.status === 'completed').length}</Typography>
              <Typography variant="body2" sx={{ color: terraColors.softTeal }}>Completed</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: terraColors.maastrichtBlue }}>{tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}</Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>High Priority</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)} aria-label="Task filters">
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
                        onChange={() => handleToggleTask(task.id)}
                        checked={task.status === 'completed'}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircleOutline sx={{ color: terraColors.tropicalRain }} />}
                      />
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      {
                        task.priority === 'high' ? <PriorityHighIcon color="error" /> :
                        task.priority === 'medium' ? <PriorityHighIcon color="warning" /> : null
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {task.dueDate && <Chip icon={<EventIcon fontSize="small" />} label={task.dueDate} size="small" variant="outlined" />}
                          {task.category && <Chip icon={<CategoryIcon fontSize="small" />} label={task.category} size="small" variant="outlined" />}
                          {task.tags && task.tags.map(tag => (
                            <Chip key={tag} icon={<TagIcon fontSize="small" />} label={tag} size="small" variant="outlined" />
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
                  <ListItemText primary="No tasks found for this filter." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        {/* Smart Suggestions */}
        <Paper sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: terraColors.paleViolet }}>
          <Typography variant="h6" sx={{ color: terraColors.prussianBlue, mb: 1 }}>
            Smart Suggestions
          </Typography>
          <Typography sx={{ color: terraColors.maastrichtBlue, mb: 1 }}>
            You have {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length} high-priority tasks due soon. Consider focusing on them first.
          </Typography>
          <Button 
            variant="text" 
            sx={{ color: terraColors.tropicalRain, alignSelf: 'flex-start' }}
          >
            Optimize My Schedule
          </Button>
        </Paper>
      </Container>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add task" 
        sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: terraColors.tropicalRain }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TasksScreen; 