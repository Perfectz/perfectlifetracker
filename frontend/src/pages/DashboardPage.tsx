/**
 * frontend/src/pages/DashboardPage.tsx
 * Main dashboard page for the application (simplified version)
 */
import React from 'react';
import {
  Typography,
  Box,
  Button,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Scale, Assignment, TrendingUp, CheckCircle } from '@mui/icons-material';
import Dashboard, { Widget } from '../components/Dashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Dashboard>
      {/* Welcome Widget */}
      <Widget id="welcome" title="Welcome to LifeTracker Pro" size="full" height="auto">
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" paragraph>
            Track your weight and manage your tasks efficiently. Your personalized dashboard is ready.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Scale />}
              onClick={() => navigate('/weight')}
            >
              Weight Tracker
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<Assignment />}
              onClick={() => navigate('/dashboard/tasks')}
            >
              Manage Tasks
            </Button>
          </Box>
        </Box>
      </Widget>

      {/* Weight Tracking Widget */}
      <Widget id="weight" title="Weight Progress" size="medium" height={350}>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Scale sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Track Your Weight
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Log daily weight measurements and monitor your progress over time.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{ height: 10, borderRadius: 5, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              75% towards your goal
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/weight')}
            sx={{ mt: 2 }}
          >
            View Weight Tracker
          </Button>
        </Box>
      </Widget>

      {/* Tasks Widget */}
      <Widget id="tasks" title="Task Management" size="medium" height={350}>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Assignment sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Your Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Stay organized with priority-based task management and progress tracking.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h6" color="primary">5</Typography>
                <Typography variant="caption">Pending</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" color="success.main">3</Typography>
                <Typography variant="caption">Completed</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" color="error.main">2</Typography>
                <Typography variant="caption">High Priority</Typography>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/dashboard/tasks')}
            sx={{ mt: 2 }}
          >
            Manage Tasks
          </Button>
        </Box>
      </Widget>

      {/* Quick Stats Widget */}
      <Widget id="stats" title="Quick Stats" size="small" height={300}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Today's Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={70}
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Weekly Goal
          </Typography>
          <LinearProgress
            variant="determinate"
            value={45}
            color="success"
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Monthly Target
          </Typography>
          <LinearProgress
            variant="determinate"
            value={80}
            color="info"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      </Widget>

      {/* Recent Activity Widget */}
      <Widget id="activity" title="Recent Activity" size="small" height={300}>
        <List dense>
          {[
            { text: 'Weight logged: 165 lbs', icon: <Scale fontSize="small" /> },
            { text: 'Task completed: Buy groceries', icon: <CheckCircle fontSize="small" /> },
            { text: 'New task added: Team meeting', icon: <Assignment fontSize="small" /> },
            { text: 'Weight goal updated', icon: <TrendingUp fontSize="small" /> },
          ].map((item, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ px: 0 }}>
                <Box sx={{ mr: 1, color: 'primary.main' }}>
                  {item.icon}
                </Box>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              {index < 3 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Widget>
    </Dashboard>
  );
};

export default DashboardPage;
