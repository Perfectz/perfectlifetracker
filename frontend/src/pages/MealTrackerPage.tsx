/**
 * frontend/src/pages/MealTrackerPage.tsx
 * Page for logging meals and tracking nutrition with AI image analysis
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  Snackbar,
  Grid,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PhotoCamera,
  Add,
  Edit,
  Delete,
  Restaurant,
  Analytics,
  ExpandMore,
  Visibility,
  Science
} from '@mui/icons-material';
import {
  fetchMealRecords,
  logMeal,
  analyzeFoodImage,
  logMealFromAnalysis,
  getDailySummary,
  updateMealRecord,
  deleteMealRecord,
  MealRecord,
  FoodAnalysis,
  DailySummary
} from '../services/mealService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meal-tabpanel-${index}`}
      aria-labelledby={`meal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MealTrackerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    foodName: '',
    mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    calories: '',
    servingSize: '',
    servingUnit: 'serving',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    brand: '',
    notes: ''
  });

  // AI analysis state
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
  const [analysisImage, setAnalysisImage] = useState<File | null>(null);
  const [analysisImagePreview, setAnalysisImagePreview] = useState<string>('');
  const [analysisMealType, setAnalysisMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMealsAndSummary();
  }, [selectedDate]);

  const loadMealsAndSummary = useCallback(async () => {
    try {
      setLoading(true);
      const [mealsData, summaryData] = await Promise.all([
        fetchMealRecords(selectedDate),
        getDailySummary(selectedDate)
      ]);
      setMeals(mealsData);
      setDailySummary(summaryData);
    } catch (error) {
      console.error('Failed to load meals data', error);
      showMessage('Failed to load meals data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const showMessage = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    setMessage(msg);
    setMessageType(type);
    setSnackbarOpen(true);
  }, []);

  // Handle manual meal logging
  const handleManualSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.foodName || !manualForm.calories) {
      showMessage('Food name and calories are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await logMeal({
        foodName: manualForm.foodName,
        mealType: manualForm.mealType,
        calories: Number(manualForm.calories),
        servingSize: manualForm.servingSize ? Number(manualForm.servingSize) : undefined,
        servingUnit: manualForm.servingUnit,
        protein: manualForm.protein ? Number(manualForm.protein) : undefined,
        carbs: manualForm.carbs ? Number(manualForm.carbs) : undefined,
        fat: manualForm.fat ? Number(manualForm.fat) : undefined,
        fiber: manualForm.fiber ? Number(manualForm.fiber) : undefined,
        sugar: manualForm.sugar ? Number(manualForm.sugar) : undefined,
        brand: manualForm.brand || undefined,
        date: selectedDate + 'T12:00:00.000Z',
        notes: manualForm.notes || undefined
      });

      // Reset form
      setManualForm({
        foodName: '',
        mealType: 'lunch',
        calories: '',
        servingSize: '',
        servingUnit: 'serving',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sugar: '',
        brand: '',
        notes: ''
      });

      await loadMealsAndSummary();
      showMessage('Meal logged successfully!', 'success');
    } catch (error) {
      console.error('Failed to log meal', error);
      showMessage('Failed to log meal', 'error');
    } finally {
      setLoading(false);
    }
  }, [manualForm, selectedDate, loadMealsAndSummary, showMessage]);

  // Handle image selection for AI analysis
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAnalysisImage(file);
      const previewUrl = URL.createObjectURL(file);
      setAnalysisImagePreview(previewUrl);
      setAnalysisResult(null);
    }
  }, []);

  // Handle AI analysis
  const handleAnalyzeImage = useCallback(async () => {
    if (!analysisImage) {
      showMessage('Please select an image first', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      const result = await analyzeFoodImage(analysisImage);
      setAnalysisResult(result.analysis);
      showMessage(result.message, 'info');
    } catch (error) {
      console.error('Failed to analyze image', error);
      showMessage('Failed to analyze image', 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [analysisImage, showMessage]);

  // Handle logging meal from AI analysis
  const handleLogFromAnalysis = useCallback(async () => {
    if (!analysisResult) {
      showMessage('No analysis result to log', 'error');
      return;
    }

    try {
      setLoading(true);
      await logMealFromAnalysis({
        analysis: analysisResult,
        mealType: analysisMealType,
        date: selectedDate + 'T12:00:00.000Z',
        imageUrl: analysisImagePreview
      });

      // Reset analysis
      setAnalysisResult(null);
      setAnalysisImage(null);
      setAnalysisImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await loadMealsAndSummary();
      showMessage('Meal logged from AI analysis!', 'success');
    } catch (error) {
      console.error('Failed to log meal from analysis', error);
      showMessage('Failed to log meal from analysis', 'error');
    } finally {
      setLoading(false);
    }
  }, [analysisResult, analysisMealType, selectedDate, analysisImagePreview, loadMealsAndSummary, showMessage]);

  // Handle edit meal
  const handleEditClick = useCallback((meal: MealRecord) => {
    setEditingMeal(meal);
    setEditDialogOpen(true);
  }, []);

  // Handle delete meal
  const handleDeleteClick = useCallback(async (mealId: string) => {
    if (!window.confirm('Are you sure you want to delete this meal entry?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteMealRecord(mealId);
      await loadMealsAndSummary();
      showMessage('Meal deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete meal', error);
      showMessage('Failed to delete meal', 'error');
    } finally {
      setLoading(false);
    }
  }, [loadMealsAndSummary, showMessage]);

  const getConfidenceColor = useCallback((confidence?: number) => {
    if (!confidence) return 'default';
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  }, []);

  // Memoize computed values
  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [meals]);

  const hasValidAnalysis = useMemo(() => {
    return analysisResult && analysisResult.foodName && analysisResult.estimatedCalories > 0;
  }, [analysisResult]);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="primary">
        <Restaurant sx={{ mr: 1, verticalAlign: 'middle' }} />
        Meal Tracker
      </Typography>

      {/* Date Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        {/* Daily Summary Cards */}
        {dailySummary && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {dailySummary.totalCalories}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Calories
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="secondary">
                    {dailySummary.totalProtein}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Protein
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {dailySummary.totalCarbs}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Carbs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {dailySummary.totalFat}g
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fat
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Tabs for different entry methods */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<PhotoCamera />} label="AI Analysis" />
          <Tab icon={<Add />} label="Manual Entry" />
          <Tab icon={<Analytics />} label="Meal History" />
        </Tabs>

        {/* AI Analysis Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ textAlign: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mb: 2 }}
            >
              Select Food Image
            </Button>

            {analysisImagePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={analysisImagePreview}
                  alt="Food preview"
                  style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain' }}
                />
                <Box sx={{ mt: 2 }}>
                  <FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel>Meal Type</InputLabel>
                    <Select
                      value={analysisMealType}
                      onChange={(e) => setAnalysisMealType(e.target.value as any)}
                    >
                      <MenuItem value="breakfast">Breakfast</MenuItem>
                      <MenuItem value="lunch">Lunch</MenuItem>
                      <MenuItem value="dinner">Dinner</MenuItem>
                      <MenuItem value="snack">Snack</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={analyzing ? <CircularProgress size={20} /> : <Science />}
                    onClick={handleAnalyzeImage}
                    disabled={analyzing}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                  </Button>
                </Box>
              </Box>
            )}

            {analysisResult && (
              <Card sx={{ mt: 2, textAlign: 'left' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{analysisResult.foodName}</Typography>
                    <Chip 
                      label={`${Math.round(analysisResult.confidence * 100)}% confidence`}
                      color={getConfidenceColor(analysisResult.confidence)}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Calories:</strong> {analysisResult.estimatedCalories}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Serving:</strong> {analysisResult.servingSize} {analysisResult.servingUnit}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        <strong>Protein:</strong> {analysisResult.macros.protein}g
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        <strong>Carbs:</strong> {analysisResult.macros.carbs}g
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2">
                        <strong>Fat:</strong> {analysisResult.macros.fat}g
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {analysisResult.description}
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleLogFromAnalysis}
                    disabled={loading}
                  >
                    Log This Meal
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>

        {/* Manual Entry Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box component="form" onSubmit={handleManualSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Food Name"
                  value={manualForm.foodName}
                  onChange={(e) => setManualForm({ ...manualForm, foodName: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Meal Type</InputLabel>
                  <Select
                    value={manualForm.mealType}
                    onChange={(e) => setManualForm({ ...manualForm, mealType: e.target.value as any })}
                  >
                    <MenuItem value="breakfast">Breakfast</MenuItem>
                    <MenuItem value="lunch">Lunch</MenuItem>
                    <MenuItem value="dinner">Dinner</MenuItem>
                    <MenuItem value="snack">Snack</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Calories"
                  type="number"
                  value={manualForm.calories}
                  onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Serving Size"
                  type="number"
                  value={manualForm.servingSize}
                  onChange={(e) => setManualForm({ ...manualForm, servingSize: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Serving Unit"
                  value={manualForm.servingUnit}
                  onChange={(e) => setManualForm({ ...manualForm, servingUnit: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Brand"
                  value={manualForm.brand}
                  onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value })}
                  fullWidth
                />
              </Grid>

              {/* Macros section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>Macronutrients (optional)</Typography>
              </Grid>
              <Grid item xs={6} md={2.4}>
                <TextField
                  label="Protein (g)"
                  type="number"
                  value={manualForm.protein}
                  onChange={(e) => setManualForm({ ...manualForm, protein: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={2.4}>
                <TextField
                  label="Carbs (g)"
                  type="number"
                  value={manualForm.carbs}
                  onChange={(e) => setManualForm({ ...manualForm, carbs: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={2.4}>
                <TextField
                  label="Fat (g)"
                  type="number"
                  value={manualForm.fat}
                  onChange={(e) => setManualForm({ ...manualForm, fat: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={2.4}>
                <TextField
                  label="Fiber (g)"
                  type="number"
                  value={manualForm.fiber}
                  onChange={(e) => setManualForm({ ...manualForm, fiber: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={2.4}>
                <TextField
                  label="Sugar (g)"
                  type="number"
                  value={manualForm.sugar}
                  onChange={(e) => setManualForm({ ...manualForm, sugar: e.target.value })}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  multiline
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Add />}
                  disabled={loading}
                  fullWidth
                >
                  Log Meal
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Meal History Tab */}
        <TabPanel value={currentTab} index={2}>
          {loading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : meals.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No meals logged for this date
            </Typography>
          ) : (
            <Box>
              {sortedMeals.map((meal) => (
                <Accordion key={meal.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6">{meal.foodName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {meal.mealType} • {meal.totalCalories} calories
                          {meal.confidence && (
                            <Chip 
                              label={`AI: ${Math.round(meal.confidence * 100)}%`}
                              size="small" 
                              sx={{ ml: 1 }}
                              color={getConfidenceColor(meal.confidence)}
                            />
                          )}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleEditClick(meal)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(meal.id)} size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Serving:</strong> {meal.servingSize} {meal.servingUnit}
                        </Typography>
                      </Grid>
                      {meal.brand && (
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Brand:</strong> {meal.brand}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          <strong>Protein:</strong> {meal.macros.protein}g
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          <strong>Carbs:</strong> {meal.macros.carbs}g
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          <strong>Fat:</strong> {meal.macros.fat}g
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          <strong>Method:</strong> {meal.analysisMethod.replace('_', ' ')}
                        </Typography>
                      </Grid>
                      {meal.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Notes:</strong> {meal.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </TabPanel>
      </Paper>

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

export default MealTrackerPage; 