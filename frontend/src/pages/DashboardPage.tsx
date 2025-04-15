/**
 * frontend/src/pages/DashboardPage.tsx
 * Main dashboard page for the application (simplified version)
 */
import React from 'react';
import { Typography, Box, Button, LinearProgress, Card, CardContent, List, ListItem, ListItemText, Divider } from '@mui/material';
import Layout from '../components/Layout';
import Dashboard, { Widget } from '../components/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <Layout title="Dashboard" useStandardHeader={true}>
      <Dashboard>
        {/* Welcome Widget */}
        <Widget 
          id="welcome" 
          title="Welcome to LifeTracker Pro" 
          size="full"
          height="auto"
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph>
              Track your fitness goals, personal development, and daily tasks all in one place.
            </Typography>
            <Button variant="contained" color="primary">
              Get Started
            </Button>
          </Box>
        </Widget>

        {/* Daily Stats Widget */}
        <Widget 
          id="stats" 
          title="Daily Stats" 
          size="medium"
          height={300}
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tasks Completed
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={70} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }} 
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Fitness Goal
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={45} 
              color="success"
              sx={{ height: 10, borderRadius: 5, mb: 2 }} 
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Water Intake
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={80} 
              color="info"
              sx={{ height: 10, borderRadius: 5, mb: 2 }} 
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Sleep Quality
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={60} 
              color="secondary"
              sx={{ height: 10, borderRadius: 5 }} 
            />
          </Box>
        </Widget>

        {/* Quick Tasks Widget */}
        <Widget 
          id="tasks" 
          title="Quick Tasks" 
          size="small"
          height={300}
        >
          <List dense>
            {['Complete project proposal', 'Workout session', 'Grocery shopping', 'Read 30 minutes', 'Team meeting'].map((task, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={task} />
                </ListItem>
                {index < 4 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Widget>

        {/* Goals Widget */}
        <Widget 
          id="goals" 
          title="Monthly Goals" 
          size="small"
          height={300}
        >
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Fitness
              </Typography>
              <Typography variant="body2">
                Complete 20 workouts this month
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" color="secondary" gutterBottom>
                Learning
              </Typography>
              <Typography variant="body2">
                Read 4 books on personal development
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="success.main" gutterBottom>
                Productivity
              </Typography>
              <Typography variant="body2">
                Complete major project milestones
              </Typography>
            </CardContent>
          </Card>
        </Widget>
      </Dashboard>
    </Layout>
  );
};

export default DashboardPage;
