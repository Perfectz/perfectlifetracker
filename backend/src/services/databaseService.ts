import { logger } from '../utils/logger';

export class DatabaseService {
  private static instance: DatabaseService;
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  async initialize(config: any): Promise<void> {
    logger.info('Database initialized');
  }
  getContainer(containerId: string): any {
    return null;
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;
