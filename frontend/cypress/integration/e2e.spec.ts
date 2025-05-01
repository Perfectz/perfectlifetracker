describe('End-to-End User Journey', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!'
  };
  
  beforeEach(() => {
    // Seed test data or mock authentication
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { 
        token: 'fake-jwt-token',
        user: { id: 'test-user-123', email: testUser.email, name: 'Test User' }
      }
    }).as('loginRequest');
    
    // Mock profile response
    cy.intercept('GET', '/api/profile', {
      statusCode: 200,
      body: { 
        id: 'profile-123',
        userId: 'test-user-123',
        name: 'Test User',
        email: testUser.email,
        fitnessLevel: 'Intermediate',
        heightCm: 175,
        weightKg: 70
      }
    }).as('getProfile');
    
    // Mock goals response
    cy.intercept('GET', '/api/goals', {
      statusCode: 200,
      body: []
    }).as('getGoals');
    
    // Mock activities response
    cy.intercept('GET', '/api/activities', {
      statusCode: 200,
      body: []
    }).as('getActivities');
    
    // Mock analytics response
    cy.intercept('GET', '/api/analytics/fitness*', {
      statusCode: 200,
      body: {
        totalDuration: 0,
        totalCalories: 0,
        averageDurationPerDay: 0
      }
    }).as('getAnalytics');
    
    // Start with login page
    cy.visit('/login');
  });
  
  it('should complete the entire user flow from login to dashboard', () => {
    // Step 1: Login
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    cy.wait('@loginRequest');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.wait(['@getProfile', '@getGoals', '@getActivities', '@getAnalytics']);
    
    // Step 2: Complete profile if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=complete-profile-banner]').length > 0) {
        cy.get('[data-cy=complete-profile-button]').click();
        cy.url().should('include', '/profile');
        
        // Fill in profile form
        cy.get('[data-cy=name-input]').clear().type('Updated Test User');
        cy.get('[data-cy=fitness-level-select]').select('Advanced');
        cy.get('[data-cy=height-input]').clear().type('180');
        cy.get('[data-cy=weight-input]').clear().type('75');
        
        // Mock profile update response
        cy.intercept('PUT', '/api/profile/*', {
          statusCode: 200,
          body: { 
            id: 'profile-123',
            userId: 'test-user-123',
            name: 'Updated Test User',
            email: testUser.email,
            fitnessLevel: 'Advanced',
            heightCm: 180,
            weightKg: 75
          }
        }).as('updateProfile');
        
        cy.get('[data-cy=save-profile-button]').click();
        cy.wait('@updateProfile');
        
        // Should redirect back to dashboard
        cy.url().should('include', '/dashboard');
      }
    });
    
    // Step 3: Add a new goal
    cy.get('[data-cy=add-goal-button]').click();
    cy.url().should('include', '/goals/new');
    
    // Fill in goal form
    cy.get('[data-cy=goal-title-input]').type('Run 10K');
    cy.get('[data-cy=goal-description-input]').type('Complete a 10K run in under 60 minutes');
    cy.get('[data-cy=goal-target-date-input]').type('2023-12-31');
    cy.get('[data-cy=goal-metric-type-select]').select('distance');
    cy.get('[data-cy=goal-target-value-input]').type('10');
    cy.get('[data-cy=goal-unit-input]').type('km');
    
    // Mock goal creation response
    cy.intercept('POST', '/api/goals', {
      statusCode: 201,
      body: { 
        id: 'goal-123',
        userId: 'test-user-123',
        title: 'Run 10K',
        description: 'Complete a 10K run in under 60 minutes',
        targetDate: '2023-12-31T00:00:00.000Z',
        metricType: 'distance',
        targetValue: 10,
        unit: 'km',
        createdAt: new Date().toISOString()
      }
    }).as('createGoal');
    
    cy.get('[data-cy=save-goal-button]').click();
    cy.wait('@createGoal');
    
    // Should redirect to goals list
    cy.url().should('include', '/goals');
    
    // Step 4: Log an activity
    cy.get('[data-cy=add-activity-button]').click();
    cy.url().should('include', '/activities/new');
    
    // Fill in activity form
    cy.get('[data-cy=activity-type-select]').select('running');
    cy.get('[data-cy=activity-duration-input]').type('45');
    cy.get('[data-cy=activity-distance-input]').type('5');
    cy.get('[data-cy=activity-calories-input]').type('500');
    cy.get('[data-cy=activity-notes-input]').type('Good progress towards my 10K goal');
    
    // Mock activity creation response
    cy.intercept('POST', '/api/activities', {
      statusCode: 201,
      body: { 
        id: 'activity-123',
        userId: 'test-user-123',
        type: 'running',
        duration: 45,
        distance: 5,
        caloriesBurned: 500,
        notes: 'Good progress towards my 10K goal',
        createdAt: new Date().toISOString()
      }
    }).as('createActivity');
    
    cy.get('[data-cy=save-activity-button]').click();
    cy.wait('@createActivity');
    
    // Should redirect to activities list
    cy.url().should('include', '/activities');
    
    // Step 5: View dashboard with updated data
    cy.get('[data-cy=nav-dashboard]').click();
    cy.url().should('include', '/dashboard');
    
    // Mock updated analytics with our new activity
    cy.intercept('GET', '/api/analytics/fitness*', {
      statusCode: 200,
      body: {
        totalDuration: 45,
        totalCalories: 500,
        averageDurationPerDay: 45
      }
    }).as('getUpdatedAnalytics');
    
    // Mock updated AI summary
    cy.intercept('POST', '/api/openai/fitness-summary', {
      statusCode: 200,
      body: {
        summary: 'You completed a 5km run in 45 minutes, burning 500 calories. This is good progress toward your 10K goal.'
      }
    }).as('getAISummary');
    
    // Refresh dashboard to see new data
    cy.get('[data-cy=refresh-dashboard]').click();
    cy.wait(['@getUpdatedAnalytics', '@getAISummary']);
    
    // Verify dashboard shows our activity data
    cy.get('[data-cy=total-duration]').should('contain', '45');
    cy.get('[data-cy=total-calories]').should('contain', '500');
    cy.get('[data-cy=ai-summary]').should('contain', 'good progress');
    
    // Verify goal progress is shown
    cy.get('[data-cy=goal-progress-card]').should('contain', 'Run 10K');
    cy.get('[data-cy=goal-progress-percentage]').should('contain', '50%');
  });
  
  // Negative test case
  it('should handle API errors gracefully', () => {
    // Step 1: Login
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    cy.wait('@loginRequest');
    
    // Mock analytics error
    cy.intercept('GET', '/api/analytics/fitness*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('analyticsError');
    
    // Mock goals error
    cy.intercept('GET', '/api/goals', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('goalsError');
    
    // Refresh dashboard to trigger errors
    cy.get('[data-cy=refresh-dashboard]').click();
    cy.wait(['@analyticsError', '@goalsError']);
    
    // Should show error message but not crash
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=retry-button]').should('be.visible');
  });
}); 