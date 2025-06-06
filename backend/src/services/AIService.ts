/**
 * backend/src/services/AIService.ts
 * Enhanced AI service with Azure OpenAI integration for intelligent task management
 */
import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import { cacheService } from './CacheService';
import { userService, User } from './UserService';
import { taskService, Task } from './TaskService';

// AI suggestion interfaces
export interface TaskSuggestion {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime?: number;
  category: 'work' | 'personal' | 'fitness' | 'learning' | 'health';
  tags: string[];
  confidence: number;
  reasoning: string;
}

export interface ProductivityInsight {
  type: 'pattern' | 'efficiency' | 'recommendation' | 'achievement';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  suggestion?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AIRecommendation {
  type: 'schedule' | 'prioritization' | 'breaks' | 'goals';
  title: string;
  description: string;
  benefits: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: number; // in minutes
}

export interface UserAnalytics {
  completionRate: number;
  averageTaskTime: number;
  mostProductiveHours: number[];
  preferredCategories: string[];
  streakDays: number;
  weeklyGrowth: number;
}

export class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    try {
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

      if (apiKey && endpoint) {
        this.openai = new OpenAI({
          apiKey,
          baseURL: `${endpoint}/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview`,
          defaultHeaders: {
            'api-key': apiKey,
          },
        });
        logger.info('Azure OpenAI initialized successfully');
      } else {
        logger.warn('Azure OpenAI credentials not found, using fallback mode');
      }
    } catch (error) {
      logger.error('Failed to initialize Azure OpenAI', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate intelligent task suggestions using Azure OpenAI
   */
  async generateTaskSuggestions(
    userId: string,
    context: string,
    category?: string,
    timeFrame?: 'today' | 'week' | 'month'
  ): Promise<TaskSuggestion[]> {
    try {
      const cacheKey = cacheService.generateKey('ai-suggestions', {
        userId,
        context: context.substring(0, 50),
        category,
        timeFrame
      });

      // Check cache first (30 minutes TTL)
      const cachedSuggestions = cacheService.get<TaskSuggestion[]>(cacheKey);
      if (cachedSuggestions) {
        logger.info('AI task suggestions retrieved from cache', {
          userId,
          count: cachedSuggestions.length
        });
        return cachedSuggestions;
      }

      // Get user analytics for personalization
      const analytics = await this.getUserAnalytics(userId);
      const recentTasks = await taskService.getUserTasks(userId, {}, { page: 1, limit: 20, sort: 'createdAt', order: 'desc' });

      let suggestions: TaskSuggestion[];

      if (this.openai) {
        // Use Azure OpenAI for intelligent suggestions
        suggestions = await this.generateIntelligentSuggestions(
          context,
          category,
          timeFrame,
          analytics,
          recentTasks.data
        );
      } else {
        // Fallback to rule-based suggestions
        suggestions = await this.generateContextualSuggestions(
          context,
          category,
          timeFrame,
          analytics,
          recentTasks.data
        );
      }

      // Cache suggestions
      cacheService.set(cacheKey, suggestions, 30 * 60 * 1000);

      logger.info('AI task suggestions generated', {
        userId,
        context: context.substring(0, 100),
        count: suggestions.length,
        aiPowered: !!this.openai
      });

      return suggestions;
    } catch (error) {
      logger.error('Failed to generate task suggestions', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate intelligent task suggestions using Azure OpenAI
   */
  private async generateIntelligentSuggestions(
    context: string,
    category?: string,
    timeFrame?: string,
    analytics?: UserAnalytics,
    recentTasks?: Task[]
  ): Promise<TaskSuggestion[]> {
    try {
      const prompt = this.buildIntelligentPrompt(context, category, timeFrame, analytics, recentTasks);
      
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert productivity assistant. Generate 3-5 practical, actionable task suggestions based on the user's context and patterns. Return only valid JSON with the exact structure requested.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      return parsed.suggestions || [];

    } catch (error) {
      logger.warn('OpenAI suggestion generation failed, falling back to rule-based', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Fallback to rule-based suggestions
      return this.generateContextualSuggestions(context, category, timeFrame, analytics, recentTasks);
    }
  }

  /**
   * Build intelligent prompt for Azure OpenAI
   */
  private buildIntelligentPrompt(
    context: string,
    category?: string,
    timeFrame?: string,
    analytics?: UserAnalytics,
    recentTasks?: Task[]
  ): string {
    const recentTaskTitles = recentTasks?.slice(0, 10).map(t => t.title).join(', ') || 'No recent tasks';
    
    return `
Context: "${context}"
Category: ${category || 'any'}
Time Frame: ${timeFrame || 'flexible'}

User Analytics:
- Completion Rate: ${analytics?.completionRate || 0}%
- Most Productive Hours: ${analytics?.mostProductiveHours?.join(', ') || 'Not available'}
- Preferred Categories: ${analytics?.preferredCategories?.join(', ') || 'Mixed'}
- Current Streak: ${analytics?.streakDays || 0} days

Recent Tasks: ${recentTaskTitles}

Please generate 3-5 practical task suggestions. Return as JSON with this exact structure:
{
  "suggestions": [
    {
      "title": "Task title (max 100 chars)",
      "description": "Brief description (optional)",
      "priority": "low|medium|high|urgent",
      "estimatedTime": 30,
      "category": "work|personal|fitness|learning|health",
      "tags": ["tag1", "tag2"],
      "confidence": 0.85,
      "reasoning": "Why this task is suggested"
    }
  ]
}

Focus on:
1. Actionable, specific tasks
2. Realistic time estimates
3. Alignment with user patterns
4. Context relevance
5. Progressive difficulty`;
  }

  /**
   * Analyze user productivity patterns and generate insights with AI enhancement
   */
  async generateProductivityInsights(userId: string): Promise<ProductivityInsight[]> {
    try {
      const cacheKey = `ai-insights:${userId}`;
      
      // Check cache first (1 hour TTL)
      const cachedInsights = cacheService.get<ProductivityInsight[]>(cacheKey);
      if (cachedInsights) {
        logger.info('Productivity insights retrieved from cache', {
          userId,
          count: cachedInsights.length
        });
        return cachedInsights;
      }

      // Get user data for analysis
      const [user, userTasks, analytics] = await Promise.all([
        userService.findById(userId),
        taskService.getUserTasks(userId, {}, { page: 1, limit: 100, sort: 'createdAt', order: 'desc' }),
        this.getUserAnalytics(userId)
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      let insights: ProductivityInsight[];

      if (this.openai && userTasks.data.length > 5) {
        // Use AI for deep pattern analysis
        insights = await this.generateAIInsights(user, userTasks.data, analytics);
      } else {
        // Use rule-based analysis
        insights = await this.analyzeProductivityPatterns(user, userTasks.data, analytics);
      }

      // Cache insights
      cacheService.set(cacheKey, insights, 60 * 60 * 1000);

      logger.info('Productivity insights generated', {
        userId,
        count: insights.length,
        aiPowered: !!this.openai
      });

      return insights;
    } catch (error) {
      logger.error('Failed to generate productivity insights', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate AI-powered productivity insights
   */
  private async generateAIInsights(
    user: User,
    tasks: Task[],
    analytics: UserAnalytics
  ): Promise<ProductivityInsight[]> {
    try {
      const prompt = this.buildInsightsPrompt(user, tasks, analytics);
      
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a productivity expert analyzing user patterns. Generate actionable insights based on task completion data and user behavior. Return only valid JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      return parsed.insights || [];

    } catch (error) {
      logger.warn('AI insights generation failed, falling back to rule-based', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return this.analyzeProductivityPatterns(user, tasks, analytics);
    }
  }

  /**
   * Build insights prompt for AI analysis
   */
  private buildInsightsPrompt(user: User, tasks: Task[], analytics: UserAnalytics): string {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    
    const tasksByCategory = tasks.reduce((acc, task) => {
      // Use the first tag as category, or 'uncategorized' if no tags
      const category = task.tags && task.tags.length > 0 ? task.tags[0] : 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
User Profile:
- Name: ${user.firstName} ${user.lastName}
- Account Age: ${Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days

Task Statistics:
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks.length}
- Overdue: ${overdueTasks.length}
- Completion Rate: ${analytics.completionRate}%
- Current Streak: ${analytics.streakDays} days

Category Distribution: ${JSON.stringify(tasksByCategory)}

Most Productive Hours: ${analytics.mostProductiveHours.join(', ')}

Generate 3-5 actionable productivity insights. Return as JSON:
{
  "insights": [
    {
      "type": "pattern|efficiency|recommendation|achievement",
      "title": "Insight title",
      "message": "Detailed insight message",
      "confidence": 0.85,
      "actionable": true,
      "suggestion": "Specific actionable suggestion",
      "impact": "low|medium|high"
    }
  ]
}

Focus on:
1. Patterns in completion times
2. Category performance
3. Time management efficiency
4. Achievement recognition
5. Improvement opportunities`;
  }

  /**
   * Generate personalized recommendations for productivity improvement
   */
  async generateRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      const cacheKey = `ai-recommendations:${userId}`;
      
      // Check cache first (2 hours TTL)
      const cachedRecommendations = cacheService.get<AIRecommendation[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }

      const analytics = await this.getUserAnalytics(userId);
      const insights = await this.generateProductivityInsights(userId);

      // Generate recommendations based on insights and analytics
      const recommendations = this.createPersonalizedRecommendations(analytics, insights);

      // Cache recommendations
      cacheService.set(cacheKey, recommendations, 2 * 60 * 60 * 1000);

      logger.info('AI recommendations generated', {
        userId,
        count: recommendations.length
      });

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate recommendations', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get comprehensive user analytics
   */
  private async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const cacheKey = `user-analytics:${userId}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const userTasks = await taskService.getUserTasks(userId, {}, { page: 1, limit: 200, sort: 'createdAt', order: 'desc' });
        const completedTasks = userTasks.data.filter(task => task.status === 'completed');
        
        // Calculate analytics
        const completionRate = userTasks.data.length > 0 ? (completedTasks.length / userTasks.data.length) * 100 : 0;
        
        const tasksWithTime = completedTasks.filter(task => task.actualTime);
        const averageTaskTime = tasksWithTime.length > 0 
          ? tasksWithTime.reduce((sum, task) => sum + (task.actualTime || 0), 0) / tasksWithTime.length
          : 0;

        // Analyze completion times to find productive hours
        const completionHours = completedTasks
          .filter(task => task.completedAt)
          .map(task => new Date(task.completedAt!).getHours());
        
        const hourCounts: Record<number, number> = {};
        completionHours.forEach(hour => {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostProductiveHours = Object.entries(hourCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([hour]) => parseInt(hour));

        // Calculate category preferences
        const categoryCount: Record<string, number> = {};
        userTasks.data.forEach(task => {
          task.tags.forEach(tag => {
            categoryCount[tag] = (categoryCount[tag] || 0) + 1;
          });
        });

        const preferredCategories = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category]) => category);

        // Calculate streak (simplified)
        const streakDays = this.calculateCompletionStreak(completedTasks);

        // Calculate weekly growth (simplified)
        const weeklyGrowth = this.calculateWeeklyGrowth(completedTasks);

        return {
          completionRate,
          averageTaskTime,
          mostProductiveHours,
          preferredCategories,
          streakDays,
          weeklyGrowth
        };
      },
      15 * 60 * 1000 // 15 minutes cache
    );
  }

  /**
   * Generate contextual suggestions based on user input and history
   */
  private async generateContextualSuggestions(
    context: string,
    category?: string,
    timeFrame?: string,
    analytics?: UserAnalytics,
    recentTasks?: Task[]
  ): Promise<TaskSuggestion[]> {
    const suggestions: TaskSuggestion[] = [];

    // Context-based suggestions
    const contextLower = context.toLowerCase();
    
    // Work-related suggestions
    if (contextLower.includes('work') || contextLower.includes('project') || contextLower.includes('meeting')) {
      suggestions.push({
        title: 'Review project milestones',
        description: 'Check progress on current projects and update timelines',
        priority: 'medium',
        estimatedTime: 30,
        category: 'work',
        tags: ['planning', 'review'],
        confidence: 0.8,
        reasoning: 'Work context detected - project management is important'
      });

      suggestions.push({
        title: 'Prepare for upcoming meetings',
        description: 'Review agenda items and prepare talking points',
        priority: 'medium',
        estimatedTime: 20,
        category: 'work',
        tags: ['preparation', 'meetings'],
        confidence: 0.75,
        reasoning: 'Work context suggests meeting preparation needs'
      });
    }

    // Learning suggestions
    if (contextLower.includes('learn') || contextLower.includes('study') || contextLower.includes('skill')) {
      suggestions.push({
        title: 'Dedicate time to skill development',
        description: 'Focus on learning new skills relevant to your goals',
        priority: 'medium',
        estimatedTime: 60,
        category: 'learning',
        tags: ['development', 'skills'],
        confidence: 0.85,
        reasoning: 'Learning context detected - skill development is valuable'
      });
    }

    // Health and fitness suggestions
    if (contextLower.includes('health') || contextLower.includes('fitness') || contextLower.includes('exercise')) {
      suggestions.push({
        title: 'Plan weekly workout schedule',
        description: 'Set up a consistent exercise routine for the week',
        priority: 'high',
        estimatedTime: 15,
        category: 'fitness',
        tags: ['planning', 'health'],
        confidence: 0.9,
        reasoning: 'Health context - physical activity planning is crucial'
      });
    }

    // Time-based suggestions
    if (timeFrame === 'today') {
      suggestions.push({
        title: 'Review today\'s priorities',
        description: 'Identify the most important tasks for today',
        priority: 'high',
        estimatedTime: 10,
        category: 'personal',
        tags: ['planning', 'priorities'],
        confidence: 0.95,
        reasoning: 'Daily focus requested - priority setting is essential'
      });
    }

    // Category-specific suggestions
    if (category) {
      suggestions.push(...this.getCategorySpecificSuggestions(category));
    }

    // Personalized suggestions based on analytics
    if (analytics) {
      suggestions.push(...this.getPersonalizedSuggestions(analytics, recentTasks));
    }

    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }

  /**
   * Get category-specific task suggestions
   */
  private getCategorySpecificSuggestions(category: string): TaskSuggestion[] {
    const suggestions: Record<string, TaskSuggestion[]> = {
      work: [
        {
          title: 'Update project documentation',
          description: 'Ensure all project documents are current and accurate',
          priority: 'medium',
          estimatedTime: 45,
          category: 'work',
          tags: ['documentation', 'maintenance'],
          confidence: 0.8,
          reasoning: 'Regular documentation updates improve team efficiency'
        }
      ],
      personal: [
        {
          title: 'Organize digital files',
          description: 'Clean up and organize computer files and folders',
          priority: 'low',
          estimatedTime: 30,
          category: 'personal',
          tags: ['organization', 'maintenance'],
          confidence: 0.7,
          reasoning: 'Digital organization improves productivity'
        }
      ],
      fitness: [
        {
          title: 'Track weekly fitness goals',
          description: 'Review and update fitness goals and progress',
          priority: 'medium',
          estimatedTime: 15,
          category: 'fitness',
          tags: ['tracking', 'goals'],
          confidence: 0.85,
          reasoning: 'Regular goal tracking improves fitness outcomes'
        }
      ],
      learning: [
        {
          title: 'Research industry trends',
          description: 'Stay updated with latest developments in your field',
          priority: 'medium',
          estimatedTime: 40,
          category: 'learning',
          tags: ['research', 'industry'],
          confidence: 0.8,
          reasoning: 'Industry knowledge keeps skills current'
        }
      ]
    };

    return suggestions[category] || [];
  }

  /**
   * Generate personalized suggestions based on user analytics
   */
  private getPersonalizedSuggestions(analytics: UserAnalytics, recentTasks?: Task[]): TaskSuggestion[] {
    const suggestions: TaskSuggestion[] = [];

    // Low completion rate suggestions
    if (analytics.completionRate < 70) {
      suggestions.push({
        title: 'Break down large tasks',
        description: 'Split complex tasks into smaller, manageable pieces',
        priority: 'high',
        estimatedTime: 20,
        category: 'personal',
        tags: ['productivity', 'planning'],
        confidence: 0.9,
        reasoning: 'Low completion rate indicates tasks may be too large'
      });
    }

    // Productivity hour optimization
    if (analytics.mostProductiveHours.length > 0) {
      const productiveHour = analytics.mostProductiveHours[0];
      suggestions.push({
        title: `Schedule important tasks at ${productiveHour}:00`,
        description: 'Align your most challenging work with your peak productivity hours',
        priority: 'medium',
        estimatedTime: 5,
        category: 'personal',
        tags: ['scheduling', 'optimization'],
        confidence: 0.85,
        reasoning: `Analysis shows you're most productive at ${productiveHour}:00`
      });
    }

    return suggestions;
  }

  /**
   * Analyze productivity patterns and generate insights
   */
  private async analyzeProductivityPatterns(
    user: User,
    tasks: Task[],
    analytics: UserAnalytics
  ): Promise<ProductivityInsight[]> {
    const insights: ProductivityInsight[] = [];

    // Completion rate insights
    if (analytics.completionRate > 80) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Task Completion',
        message: `You have an ${analytics.completionRate.toFixed(1)}% task completion rate - that's outstanding!`,
        confidence: 0.95,
        actionable: false,
        impact: 'high'
      });
    } else if (analytics.completionRate < 50) {
      insights.push({
        type: 'recommendation',
        title: 'Improve Task Completion',
        message: `Your completion rate is ${analytics.completionRate.toFixed(1)}%. Consider breaking tasks into smaller pieces.`,
        confidence: 0.9,
        actionable: true,
        suggestion: 'Break large tasks into smaller, manageable subtasks',
        impact: 'high'
      });
    }

    // Productivity pattern insights
    if (analytics.mostProductiveHours.length > 0) {
      const hour = analytics.mostProductiveHours[0];
      insights.push({
        type: 'pattern',
        title: 'Peak Productivity Hours',
        message: `You complete most tasks around ${hour}:00. Consider scheduling important work during this time.`,
        confidence: 0.8,
        actionable: true,
        suggestion: `Block ${hour}:00-${hour + 2}:00 for your most important tasks`,
        impact: 'medium'
      });
    }

    // Streak insights
    if (analytics.streakDays > 7) {
      insights.push({
        type: 'achievement',
        title: 'Great Consistency',
        message: `You've completed tasks for ${analytics.streakDays} consecutive days!`,
        confidence: 0.9,
        actionable: false,
        impact: 'medium'
      });
    }

    // Category preference insights
    if (analytics.preferredCategories.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Category Preferences',
        message: `You focus most on: ${analytics.preferredCategories.slice(0, 2).join(', ')}`,
        confidence: 0.75,
        actionable: true,
        suggestion: 'Consider diversifying your task categories for balanced growth',
        impact: 'low'
      });
    }

    return insights;
  }

  /**
   * Create personalized recommendations
   */
  private createPersonalizedRecommendations(
    analytics: UserAnalytics,
    insights: ProductivityInsight[]
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Time management recommendations
    if (analytics.mostProductiveHours.length > 0) {
      recommendations.push({
        type: 'schedule',
        title: 'Optimize Your Schedule',
        description: 'Align your most important tasks with your peak productivity hours',
        benefits: [
          'Increased task completion rates',
          'Higher quality work output',
          'Reduced time spent on difficult tasks'
        ],
        difficulty: 'easy',
        timeToImplement: 15
      });
    }

    // Task management recommendations
    if (analytics.completionRate < 70) {
      recommendations.push({
        type: 'prioritization',
        title: 'Implement Task Breakdown Strategy',
        description: 'Break large tasks into smaller, manageable chunks',
        benefits: [
          'Higher completion rates',
          'Reduced overwhelm',
          'Better progress tracking'
        ],
        difficulty: 'medium',
        timeToImplement: 30
      });
    }

    // Break recommendations
    if (analytics.averageTaskTime > 120) {
      recommendations.push({
        type: 'breaks',
        title: 'Implement Pomodoro Technique',
        description: 'Use 25-minute focused work sessions with 5-minute breaks',
        benefits: [
          'Improved focus and concentration',
          'Reduced mental fatigue',
          'Better time awareness'
        ],
        difficulty: 'easy',
        timeToImplement: 5
      });
    }

    // Goal setting recommendations
    recommendations.push({
      type: 'goals',
      title: 'Set SMART Weekly Goals',
      description: 'Create specific, measurable, achievable, relevant, and time-bound goals',
      benefits: [
        'Clearer direction and purpose',
        'Better progress tracking',
        'Increased motivation'
      ],
      difficulty: 'medium',
      timeToImplement: 20
    });

    return recommendations;
  }

  /**
   * Calculate completion streak days
   */
  private calculateCompletionStreak(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const tasksThisDay = completedTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate >= dayStart && completedDate <= dayEnd;
      });

      if (tasksThisDay.length > 0) {
        streak++;
      } else if (i > 0) { // Allow for today to be incomplete
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Calculate weekly growth percentage
   */
  private calculateWeeklyGrowth(completedTasks: Task[]): number {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= oneWeekAgo;
    });

    const lastWeekTasks = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= twoWeeksAgo && completedDate < oneWeekAgo;
    });

    if (lastWeekTasks.length === 0) return thisWeekTasks.length > 0 ? 100 : 0;
    
    return ((thisWeekTasks.length - lastWeekTasks.length) / lastWeekTasks.length) * 100;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
export default aiService; 