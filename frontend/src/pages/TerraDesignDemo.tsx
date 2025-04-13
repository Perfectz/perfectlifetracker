/**
 * frontend/src/pages/TerraDesignDemo.tsx
 * Demo page showcasing the Terra color scheme implementation
 */
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import TerraDashboardPage from './TerraDashboardPage';
import TerraMobileView from '../components/TerraMobileView';
import { terraColors } from '../../src/theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`terra-tabpanel-${index}`}
      aria-labelledby={`terra-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
};

const TerraDesignDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          textAlign: 'center',
          backgroundColor: terraColors.pearl,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          color={terraColors.prussianBlue}
          fontWeight="bold"
        >
          PerfectLifeTrack Pro - Terra Color Scheme
        </Typography>
        <Typography
          variant="h6"
          color={terraColors.maastrichtBlue}
          sx={{ maxWidth: '800px', mx: 'auto' }}
        >
          A demonstration of the new Terra color palette implementation
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab label="Desktop Interface" id="terra-tab-0" />
          <Tab label="Mobile Interface" id="terra-tab-1" />
          <Tab label="Color Palette" id="terra-tab-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            color={terraColors.prussianBlue}
            sx={{ mb: 4 }}
          >
            Desktop Interface
          </Typography>
          <TerraDashboardPage />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            color={terraColors.prussianBlue}
            sx={{ mb: 4 }}
          >
            Mobile Interface
          </Typography>
          <TerraMobileView />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            color={terraColors.prussianBlue}
            sx={{ mb: 4 }}
          >
            Terra Color Palette
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3 }}>
            <ColorSwatch color={terraColors.pearl} name="Pearl" hex="#E8DDCB" usage="Background" />
            <ColorSwatch
              color={terraColors.softTeal}
              name="Soft Teal"
              hex="#70A9A1"
              usage="Borders, Accents"
            />
            <ColorSwatch
              color={terraColors.tropicalRain}
              name="Teal"
              hex="#036564"
              usage="Interactive Elements"
            />
            <ColorSwatch
              color={terraColors.prussianBlue}
              name="Blue"
              hex="#033649"
              usage="App Bars, Important Text"
            />
            <ColorSwatch
              color={terraColors.maastrichtBlue}
              name="Navy"
              hex="#031634"
              usage="Primary Text"
            />
          </Box>
        </Box>
      </TabPanel>
    </Container>
  );
};

interface ColorSwatchProps {
  color: string;
  name: string;
  hex: string;
  usage: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, name, hex, usage }) => {
  return (
    <Box
      sx={{
        width: 200,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: color,
          height: 100,
          width: '100%',
          borderRadius: 2,
          mb: 1,
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      />
      <Typography variant="subtitle1" fontWeight="bold">
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hex}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {usage}
      </Typography>
    </Box>
  );
};

export default TerraDesignDemo;
