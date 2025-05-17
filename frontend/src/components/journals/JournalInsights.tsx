import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Divider, Chip, List, ListItem, ListItemText, CircularProgress, Alert, Button } from '@mui/material';
import { getTopicAnalysis, getSentimentTrends, getMoodRecommendations } from '../../services/journals/journalApi';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// Interfaces for the insights data
interface TopicAnalysis {
  topTopics: Array<{ topic: string, frequency: number }>;
  topicSentiment: Array<{ topic: string, sentiment: number }>;
}

interface SentimentTrend {
  trendByDay: Array<{ date: string, sentiment: number }>;
  trendByWeek: Array<{ weekStart: string, sentiment: number }>;
  trendByMonth: Array<{ month: string, sentiment: number }>;
}

interface MoodRecommendation {
  moodSummary: string;
  recommendations: string[];
  positivePatterns: string[];
  negativePatterns: string[];
}

const JournalInsights: React.FC = () => {
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState<TopicAnalysis | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentTrend | null>(null);
  const [recommendationData, setRecommendationData] = useState<MoodRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        
        // Fetch all three insights in parallel
        const [topicsResponse, sentimentResponse, recommendationsResponse] = await Promise.all([
          getTopicAnalysis(),
          getSentimentTrends(),
          getMoodRecommendations()
        ]);
        
        setTopicData(topicsResponse);
        setSentimentData(sentimentResponse);
        setRecommendationData(recommendationsResponse);
        setError('');
      } catch (err) {
        console.error('Error fetching journal insights:', err);
        setError('Failed to load journal insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return '#2e7d32'; // Green - very positive
    if (sentiment >= 0.6) return '#4caf50'; // Light green - positive
    if (sentiment >= 0.5) return '#8bc34a'; // Lime - slightly positive
    if (sentiment >= 0.4) return '#ffeb3b'; // Yellow - neutral
    if (sentiment >= 0.3) return '#ff9800'; // Orange - slightly negative
    if (sentiment >= 0.2) return '#f44336'; // Red - negative
    return '#b71c1c'; // Dark red - very negative
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/journals')}
            sx={{ mr: 2 }}
          >
            Back to Journals
          </Button>
          <Typography variant="h4" component="h1">
            Journal Insights
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Discover patterns and insights from your journal entries.
        </Typography>

        {/* Mood Summary & Recommendations */}
        {recommendationData && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Mood Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {recommendationData.moodSummary || "We don't have enough journal entries to analyze your mood patterns yet."}
            </Typography>

            {recommendationData.recommendations && recommendationData.recommendations.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Recommendations
                </Typography>
                <List>
                  {recommendationData.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {recommendationData.positivePatterns && recommendationData.positivePatterns.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Positive Patterns
                </Typography>
                <List>
                  {recommendationData.positivePatterns.map((pattern, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={pattern} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        )}

        {/* Top Topics */}
        {topicData && topicData.topTopics && topicData.topTopics.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Common Topics
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} my={2}>
              {topicData.topTopics.map((topic, index) => (
                <Chip 
                  key={index} 
                  label={`${topic.topic} (${topic.frequency})`} 
                  size="medium"
                />
              ))}
            </Box>

            {topicData.topicSentiment && topicData.topicSentiment.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Topic Sentiment
                </Typography>
                <Box my={2}>
                  {topicData.topicSentiment.map((topic, index) => (
                    <Box key={index} mb={1} display="flex" alignItems="center">
                      <Typography variant="body1" sx={{ minWidth: 120 }}>
                        {topic.topic}:
                      </Typography>
                      <Box 
                        height={12} 
                        width={`${Math.min(topic.sentiment * 100, 100)}%`} 
                        bgcolor={getSentimentColor(topic.sentiment)}
                        borderRadius={1}
                        ml={1}
                      />
                      <Typography variant="body2" color="text.secondary" ml={1}>
                        {(topic.sentiment * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        )}

        {/* Sentiment Trends */}
        {sentimentData && sentimentData.trendByDay && sentimentData.trendByDay.length > 0 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Sentiment Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This shows how your mood has changed over time based on your journal entries.
            </Typography>
            
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Daily Sentiment
              </Typography>
              <Box height={150} display="flex" alignItems="flex-end" gap={1}>
                {sentimentData.trendByDay.map((day, index) => {
                  const height = `${Math.max(day.sentiment * 100, 10)}%`;
                  return (
                    <Box 
                      key={index} 
                      height={height} 
                      width="18px" 
                      bgcolor={getSentimentColor(day.sentiment)}
                      borderRadius="4px 4px 0 0"
                      title={`${new Date(day.date).toLocaleDateString()}: ${(day.sentiment * 100).toFixed(0)}%`}
                      sx={{
                        transition: 'height 0.3s ease',
                        '&:hover': { opacity: 0.8, transform: 'scaleY(1.05)' }
                      }}
                    />
                  );
                })}
              </Box>
              <Box mt={1} display="flex" justifyContent="space-between">
                <Typography variant="caption">
                  {sentimentData.trendByDay.length > 0 
                    ? new Date(sentimentData.trendByDay[0].date).toLocaleDateString() 
                    : ''}
                </Typography>
                <Typography variant="caption">
                  {sentimentData.trendByDay.length > 0 
                    ? new Date(sentimentData.trendByDay[sentimentData.trendByDay.length - 1].date).toLocaleDateString() 
                    : ''}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default JournalInsights; 