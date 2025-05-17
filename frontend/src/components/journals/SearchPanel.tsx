// frontend/src/components/journals/SearchPanel.tsx
// Search panel for journal entries with faceted search

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Checkbox,
  FormControlLabel,
  Slider,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Badge,
  Collapse,
  Pagination
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSearchJournalEntries } from '../../hooks/useJournals';
import { SearchQuery, JournalEntry, PaginatedJournalResponse } from '../../types/journal';
import { format } from 'date-fns';
import { InfiniteData } from '@tanstack/react-query';

// Define interfaces
interface TagCount {
  tag: string;
  count: number;
}

// Export the Facet interface so it can be used in other files
export interface Facet {
  value: string;
  count: number;
}

interface SearchPanelProps {
  onSelectEntry: (entryId: string) => void;
}

// Create a type for the data returned from useSearchJournalEntries
type SearchResultData = InfiniteData<PaginatedJournalResponse>;

const SearchPanel: React.FC<SearchPanelProps> = ({ onSelectEntry }) => {
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sentimentRange, setSentimentRange] = useState<[number, number]>([0, 1]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showTagFilters, setShowTagFilters] = useState(false);
  const [showSentimentFilter, setShowSentimentFilter] = useState(false);
  
  // Create the actual query object
  const query: SearchQuery = {
    q: searchQuery.trim(),
    startDate: startDate ? startDate.toISOString() : undefined,
    endDate: endDate ? endDate.toISOString() : undefined,
    minSentiment: sentimentRange[0],
    maxSentiment: sentimentRange[1],
    tags: selectedTags,
    limit: pageSize
  };
  
  // Skip the search if no search terms
  const enabled = !!searchQuery.trim();
  
  // Execute the search with proper typing
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    fetchNextPage,
    hasNextPage
  } = useSearchJournalEntries(query, pageSize, enabled);
  
  // Reset pagination when search params change (except page)
  useEffect(() => {
    setPage(1);
  }, [searchQuery, startDate, endDate, sentimentRange, selectedTags.join(',')]);
  
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // The search happens automatically due to the useQuery hook
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setSentimentRange([0, 1]);
    setSelectedTags([]);
    setPage(1);
  };
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleSentimentChange = (_event: Event, newValue: number | number[]) => {
    setSentimentRange(newValue as [number, number]);
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Extract tags from facets with proper typing for InfiniteData structure
  const getAvailableTags = (): TagCount[] => {
    // Use proper type assertion to InfiniteData<PaginatedJournalResponse>
    if (!data) return [];
    
    // Access the first page in the pages array
    if (!data.pages || data.pages.length === 0) return [];
    
    const firstPage = data.pages[0];
    if (!firstPage.facets || !firstPage.facets.tags) return [];
    
    return firstPage.facets.tags.map((t: Facet) => ({
      tag: t.value,
      count: t.count
    }));
  };
  
  const availableTags = getAvailableTags();
  
  // Get all entries from all pages
  const getAllEntries = (): JournalEntry[] => {
    if (!data || !data.pages) return [];
    
    // Use flatMap to gather all entries from all pages
    return data.pages.flatMap((page: PaginatedJournalResponse) => page.items || []);
  };
  
  // Get the total count from the first page
  const getTotalCount = (): number => {
    if (!data || !data.pages || data.pages.length === 0) return 0;
    
    try {
      const firstPage = data.pages[0];
      
      if (firstPage.count !== undefined) {
        return firstPage.count;
      }
      
      if (firstPage.items && Array.isArray(firstPage.items)) {
        return firstPage.items.length;
      }
      
      return 0;
    } catch (err) {
      console.error('Error getting count in search results', err);
      return 0;
    }
  };
  
  // Render sentiment label
  const sentimentValueText = (value: number) => {
    if (value >= 0.7) return 'Very Positive';
    if (value >= 0.55) return 'Positive';
    if (value >= 0.45) return 'Neutral';
    if (value >= 0.3) return 'Negative';
    return 'Very Negative';
  };
  
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            label="Search Journal Entries"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Box>
              <Button 
                type="button" 
                onClick={handleClear}
                sx={{ mr: 1 }}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!searchQuery.trim() || isLoading}
              >
                Search
              </Button>
            </Box>
          </Box>
          
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Use React.createElement with proper type handling for DatePicker */}
                  {React.createElement(DatePicker, {
                    label: "From Date",
                    value: startDate,
                    onChange: (newValue: unknown) => setStartDate(newValue as Date | null),
                    // @ts-ignore - MUI components have different typings between versions
                    slotProps: { textField: { size: 'small', fullWidth: true } }
                  })}
                  {React.createElement(DatePicker, {
                    label: "To Date", 
                    value: endDate,
                    onChange: (newValue: unknown) => setEndDate(newValue as Date | null),
                    // @ts-ignore - MUI components have different typings between versions
                    slotProps: { textField: { size: 'small', fullWidth: true } }
                  })}
                </Box>
              </LocalizationProvider>
              
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Sentiment Range</Typography>
                  <Button
                    size="small"
                    onClick={() => setShowSentimentFilter(!showSentimentFilter)}
                    startIcon={showSentimentFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    {showSentimentFilter ? 'Hide' : 'Show'}
                  </Button>
                </Box>
                
                <Collapse in={showSentimentFilter}>
                  <Box sx={{ px: 2, mt: 1 }}>
                    <Slider
                      value={sentimentRange}
                      onChange={handleSentimentChange}
                      valueLabelDisplay="auto"
                      valueLabelFormat={sentimentValueText}
                      min={0}
                      max={1}
                      step={0.05}
                      marks={[
                        { value: 0, label: 'Negative' },
                        { value: 0.5, label: 'Neutral' },
                        { value: 1, label: 'Positive' }
                      ]}
                    />
                  </Box>
                </Collapse>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Tags</Typography>
                  <Button
                    size="small"
                    onClick={() => setShowTagFilters(!showTagFilters)}
                    startIcon={showTagFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    disabled={availableTags.length === 0}
                  >
                    {showTagFilters ? 'Hide' : 'Show'}
                  </Button>
                </Box>
                
                <Collapse in={showTagFilters}>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {availableTags.length > 0 ? (
                      <List dense>
                        {availableTags.map(({ tag, count }: TagCount) => (
                          <ListItem key={tag}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedTags.includes(tag)}
                                  onChange={() => handleTagToggle(tag)}
                                  size="small"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                  <Typography variant="body2">{tag}</Typography>
                                  <Badge badgeContent={count} color="primary" />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No tags available
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Paper>
      
      <Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>
              Error: {(error as Error)?.message || 'An error occurred while searching'}
            </Typography>
          </Paper>
        ) : getAllEntries().length === 0 && enabled ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">No matching journal entries found</Typography>
          </Paper>
        ) : getAllEntries().length > 0 ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {getTotalCount()} {getTotalCount() === 1 ? 'entry' : 'entries'} found
            </Typography>
            
            <List>
              {getAllEntries().map((entry: JournalEntry) => (
                <React.Fragment key={entry.id}>
                  <ListItem 
                    button 
                    onClick={() => onSelectEntry(entry.id)}
                    sx={{ 
                      borderLeft: '4px solid', 
                      borderLeftColor: 
                        entry.sentimentScore >= 0.6 ? 'success.main' : 
                        entry.sentimentScore >= 0.4 ? 'info.main' : 'error.main',
                      mb: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle1">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </Typography>
                          {entry.createdAt && (
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(entry.createdAt), 'PPp')}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ 
                              maxHeight: '50px', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {entry.content}
                          </Typography>
                          
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {entry.tags && entry.tags.length > 0 && (
                              <Box display="flex" gap={0.5}>
                                {entry.tags.slice(0, 3).map((tag: string) => (
                                  <Chip key={tag} label={tag} size="small" />
                                ))}
                                {entry.tags.length > 3 && (
                                  <Chip label={`+${entry.tags.length - 3}`} size="small" />
                                )}
                              </Box>
                            )}
                            
                            {entry.attachments?.length > 0 && (
                              <Badge 
                                badgeContent={entry.attachments.length} 
                                color="primary"
                                sx={{ ml: 'auto' }}
                              >
                                <Typography variant="caption">Attachments</Typography>
                              </Badge>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {getTotalCount() > pageSize && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(getTotalCount() / pageSize)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default SearchPanel; 