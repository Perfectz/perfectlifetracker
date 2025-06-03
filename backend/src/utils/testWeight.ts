/**
 * Simple script to test weight logging and retrieval functionality in FitnessModel
 * Run with `npx ts-node src/utils/testWeight.ts` from the backend folder
 */
import dotenv from 'dotenv';
import FitnessModel from '../models/FitnessModel';

// Load environment variables
dotenv.config();

async function main() {
  const fitnessModel = new FitnessModel();
  const userId = 'test-user';
  console.log('=== Testing weight logging ===');
  // Log a new weight measurement
  const newRecord = await fitnessModel.logMeasurement(userId, {
    measurementType: 'weight',
    value: 72.5,
    unit: 'kg',
    date: new Date().toISOString().split('T')[0] // today's date in yyyy-mm-dd
  });
  console.log('Logged record:', newRecord);

  console.log('=== Testing retrieval of weight records ===');
  const allRecords = await fitnessModel.getUserFitnessRecords(userId);
  console.log('Fetched records:', allRecords);

  if (allRecords.some(r => r.id === newRecord.id)) {
    console.log('✅ Weight record successfully logged and retrieved.');
  } else {
    console.error('❌ Logged record not found in retrieval.');
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Test completed successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test encountered an error:', err);
    process.exit(1);
  }); 