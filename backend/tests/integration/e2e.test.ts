import request from 'supertest';
import { setupTestServer } from './server';

describe('End-to-End Integration Flow', () => {
  let profileId: string;
  let goalId: string;
  let activityId: string;
  const app = setupTestServer();

  it('should verify the health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'up');
  });

  it('should create a user profile', async () => {
    const response = await request(app)
      .post('/api/profile')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        fitnessLevel: 'Intermediate',
        heightCm: 175,
        weightKg: 70
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    profileId = response.body.id;
  });

  it('should create a fitness goal', async () => {
    const response = await request(app)
      .post('/api/goals')
      .send({
        title: 'Run 5K',
        description: 'Complete a 5K run in under 30 minutes',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metricType: 'distance',
        targetValue: 5,
        unit: 'km'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    goalId = response.body.id;
  });

  it('should log a fitness activity', async () => {
    const response = await request(app)
      .post('/api/activities')
      .send({
        type: 'running',
        duration: 25,
        distance: 3,
        caloriesBurned: 300,
        notes: 'Felt good today'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    activityId = response.body.id;
  });

  it('should retrieve analytics data', async () => {
    const response = await request(app)
      .get('/api/analytics/fitness')
      .query({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalDuration');
    expect(response.body).toHaveProperty('totalCalories');
    expect(response.body).toHaveProperty('averageDurationPerDay');
  });

  it('should get AI-generated fitness summary', async () => {
    const response = await request(app)
      .post('/api/openai/fitness-summary')
      .send({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('summary');
    expect(typeof response.body.summary).toBe('string');
  });

  // Cleanup test data
  it('should delete created activity', async () => {
    const response = await request(app)
      .delete(`/api/activities/${activityId}`);

    expect(response.status).toBe(204);
  });

  it('should delete created goal', async () => {
    const response = await request(app)
      .delete(`/api/goals/${goalId}`);

    expect(response.status).toBe(204);
  });

  it('should delete user profile', async () => {
    const response = await request(app)
      .delete(`/api/profile/${profileId}`);

    expect(response.status).toBe(204);
  });
}); 