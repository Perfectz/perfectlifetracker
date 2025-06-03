/**
 * Simple script to test retrieval of only weight measurement records in FitnessModel
 * Run with `npx ts-node src/utils/testWeightList.ts` from the backend folder
 */
import dotenv from 'dotenv';
import FitnessModel from '../models/FitnessModel';

dotenv.config();

async function main() {
  const fitnessModel = new FitnessModel();
  const userId = 'test-user';
  console.log('=== Testing retrieval of weight records ===');

  // Fetch all measurement records for the test user
  const measurements = await fitnessModel.getRecordsByType(userId, 'measurement');
  // Filter down to weight entries
  const weightRecords = measurements.filter(r => r.measurementType === 'weight');
  console.log('Weight records:', weightRecords);

  if (Array.isArray(weightRecords)) {
    console.log('✅ Successfully retrieved weight records.');
  } else {
    console.error('❌ Failed to retrieve weight records.');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test encountered an error:', err);
    process.exit(1);
  }); 