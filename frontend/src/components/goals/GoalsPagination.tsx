// frontend/src/components/goals/GoalsPagination.tsx
// Reusable pagination component for goals list

import React from 'react';
import { 
  Box, 
  Pagination, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Typography
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';

interface GoalsPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  showItemsPerPageSelector?: boolean;
  showSummary?: boolean;
}

const GoalsPagination: React.FC<GoalsPaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  showItemsPerPageSelector = true,
  showSummary = true
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Available options for items per page
  const perPageOptions = [5, 10, 25, 50];
  
  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('page', newPage.toString());
      return newParams;
    });
  };
  
  // Handle limit change
  const handleLimitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newLimit = Number(event.target.value);
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('limit', newLimit.toString());
      newParams.set('page', '1'); // Reset to page 1 when changing limit
      return newParams;
    });
  };

  // Don't show pagination if there's only one page and no per-page selector
  if (totalPages <= 1 && !showItemsPerPageSelector && !showSummary) {
    return null;
  }

  // Calculate range of items being displayed
  const startItem = Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Pagination controls */}
      <Box display="flex" justifyContent="center" alignItems="center">
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            data-testid="goals-pagination"
          />
        )}
        
        {showItemsPerPageSelector && (
          <FormControl variant="outlined" size="small" sx={{ ml: 2, minWidth: 100 }}>
            <InputLabel id="limit-select-label">Per Page</InputLabel>
            <Select
              labelId="limit-select-label"
              value={itemsPerPage}
              onChange={handleLimitChange as any}
              label="Per Page"
              data-testid="items-per-page"
            >
              {perPageOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      
      {/* Pagination summary */}
      {showSummary && totalItems > 0 && (
        <Box display="flex" justifyContent="space-between" mt={2} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          <Typography variant="body2">
            Showing {startItem} to {endItem} of {totalItems} items
          </Typography>
          <Typography variant="body2">
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GoalsPagination; 