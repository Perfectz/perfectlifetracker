import { Router } from 'express';
import { Container } from '@azure/cosmos';
import { TextAnalyticsClient } from '@azure/ai-text-analytics';

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  date: string;
  sentimentScore: number;
}

export function createJournalRouter(container: Container, textClient: TextAnalyticsClient) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: 'userId and content required' });
    }
    try {
      const [result] = await textClient.analyzeSentiment([content]);
      const score = result.confidenceScores.positive;
      const entry: JournalEntry = {
        id: Date.now().toString(),
        userId,
        content,
        sentimentScore: score,
        date: new Date().toISOString(),
      };
      await container.items.create(entry);
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ message: 'Error saving journal entry' });
    }
  });

  router.get('/', async (_req, res) => {
    try {
      const { resources } = await container.items
        .query('SELECT * FROM c')
        .fetchAll();
      res.status(200).json(resources as JournalEntry[]);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving entries' });
    }
  });

  return router;
}
