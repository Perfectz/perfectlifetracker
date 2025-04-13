/**
 * frontend/src/components/TasksCard.tsx
 * Card component for displaying and managing user tasks
 */
import React, { useState } from 'react';
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

  const handleToggleTask = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color={terraColors.prussianBlue} gutterBottom>
          {title}
        </Typography>

        <List sx={{ mt: 1 }}>
          {tasks.map(task => (
            <ListItem
              key={task.id}
              disablePadding
              sx={{
                borderBottom: `1px solid ${terraColors.pearl}`,
                py: 0.5,
              }}
            >
              <ListItemButton role={undefined} onClick={() => handleToggleTask(task.id)} dense>
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
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TasksCard;
