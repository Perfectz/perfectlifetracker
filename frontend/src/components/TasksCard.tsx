/**
 * frontend/src/components/TasksCard.tsx
 * Card component for displaying and managing user tasks
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material';
import { terraColors } from '../../src/theme';

// Define the task interface
interface Task {
  id: number;
  name: string;
  completed: boolean;
}

// Sample tasks data
const sampleTasks: Task[] = [
  { id: 1, name: 'Team meeting at 2 PM', completed: false },
  { id: 2, name: 'Send project proposal', completed: true },
  { id: 3, name: 'Prepare presentation', completed: false },
  { id: 4, name: 'Review feedback', completed: false },
];

// Styled components
const TerraCheckbox = styled(Checkbox)(({ theme }) => ({
  color: terraColors.softTeal,
  '&.Mui-checked': {
    color: terraColors.tropicalRain,
  },
}));

const CompletedTaskText = styled(ListItemText)(({ theme }) => ({
  textDecoration: 'line-through',
  color: terraColors.softTeal,
}));

interface TasksCardProps {
  tasks?: Task[];
  title?: string;
}

const TasksCard: React.FC<TasksCardProps> = ({
  tasks: initialTasks = sampleTasks,
  title = 'Tasks',
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Memoize the toggle handler to prevent re-renders
  const handleToggleTask = useCallback((taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  }, []);

  // Memoize the rendered task list
  const renderedTasks = useMemo(() => (
    tasks.map(task => (
      <ListItem
        key={task.id}
        disablePadding
        secondaryAction={null}
      >
        <ListItemButton onClick={() => handleToggleTask(task.id)}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <TerraCheckbox
              edge="start"
              checked={task.completed}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          {task.completed ? (
            <CompletedTaskText primary={task.name} />
          ) : (
            <ListItemText primary={task.name} />
          )}
        </ListItemButton>
      </ListItem>
    ))
  ), [tasks, handleToggleTask]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          {title}
        </Typography>

        <List sx={{ mt: 1 }}>
          {renderedTasks}
        </List>
      </CardContent>
    </Card>
  );
};

export default TasksCard;
