import request from 'supertest';
import express from 'express';
import { createJournalRouter, JournalEntry } from './journals';

describe('journals routes', () => {
  const container = {
    items: {
      create: jest.fn(),
      query: jest.fn(),
    },
  } as any;

  const textClient = {
    analyzeSentiment: jest.fn(),
  } as any;

  const app = express();
  app.use(express.json());
  app.use('/journals', createJournalRouter(container, textClient));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves entry with sentiment', async () => {
    textClient.analyzeSentiment.mockResolvedValue([{ confidenceScores: { positive: 0.8 } }]);
    container.items.create.mockResolvedValue({ resource: { id: '1' } });

    const res = await request(app).post('/journals').send({ userId: 'u1', content: 'hello' });

    expect(res.status).toBe(201);
    expect(textClient.analyzeSentiment).toHaveBeenCalledWith(['hello']);
    expect(container.items.create).toHaveBeenCalled();
    expect(res.body.sentimentScore).toBe(0.8);
  });

  it('retrieves entries', async () => {
    const entries: JournalEntry[] = [
      { id: '1', userId: 'u1', content: 'hi', sentimentScore: 0.9, date: 'd' },
    ];
    container.items.query.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: entries }) });

    const res = await request(app).get('/journals');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(entries);
  });
});
