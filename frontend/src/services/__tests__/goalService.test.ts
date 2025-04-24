import axios from 'axios';
import goalService, { PaginatedResponse, FitnessGoal } from '../goalService';
import { API_CONFIG } from '../../config';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('goalService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful response for all tests
    const mockResponse = {
      data: {
        items: [],
        total: 0,
        limit: 10,
        offset: 0
      }
    };
    
    mockedAxios.get.mockResolvedValue(mockResponse);
  });
  
  describe('getGoals', () => {
    it('should include pagination parameters in the URL when specified', async () => {
      // Call the method with pagination parameters
      await goalService.getGoals({ limit: 10, offset: 5 });
      
      // Check if axios.get was called with the correct URL
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      const calledUrl = mockedAxios.get.mock.calls[0][0];
      
      // URL should contain the pagination parameters
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('offset=5');
    });
    
    it('should not include undefined pagination parameters in the URL', async () => {
      // Call the method without pagination parameters
      await goalService.getGoals();
      
      // Check if axios.get was called with the correct URL
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      const calledUrl = mockedAxios.get.mock.calls[0][0];
      
      // URL should not contain pagination parameters
      expect(calledUrl).not.toContain('limit=');
      expect(calledUrl).not.toContain('offset=');
      expect(calledUrl).toBe(`${API_CONFIG.BASE_URL}/goals`);
    });
    
    it('should include only defined pagination parameters', async () => {
      // Call the method with only limit
      await goalService.getGoals({ limit: 20 });
      
      // Check URL has only limit
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      const calledUrl = mockedAxios.get.mock.calls[0][0];
      
      expect(calledUrl).toContain('limit=20');
      expect(calledUrl).not.toContain('offset=');
      
      // Reset and call with only offset
      jest.clearAllMocks();
      await goalService.getGoals({ offset: 30 });
      
      const secondUrl = mockedAxios.get.mock.calls[0][0];
      expect(secondUrl).not.toContain('limit=');
      expect(secondUrl).toContain('offset=30');
    });
    
    it('should handle the response correctly', async () => {
      // Mock response with data
      const mockData: PaginatedResponse<FitnessGoal> = {
        items: [
          {
            id: 'goal-1',
            userId: 'user-1',
            title: 'Test Goal',
            targetDate: '2025-01-01',
            createdAt: '2025-01-01',
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      };
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });
      
      // Call the method
      const result = await goalService.getGoals();
      
      // Check the result
      expect(result).toEqual(mockData);
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Test Goal');
    });
  });
}); 