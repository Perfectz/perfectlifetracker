import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

/**
 * Generate a test JWT token with the given user ID
 */
export const generateTestToken = (userId: string): string => {
  return jwt.sign(
    { 
      sub: userId,
      email: `${userId}@example.com`,
      name: 'Test User'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}; 