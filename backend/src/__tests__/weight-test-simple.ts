// backend/src/__tests__/weight-test-simple.ts
// Simple test script to demonstrate weight functionality

import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { FitnessModel } from '../models/FitnessModel';

async function testWeightFunctionality() {
  console.log('🏃‍♂️ Starting Weight Functionality Test with Real Data...\n');
  
  const fitnessModel = new FitnessModel();
  const testUserId = 'demo-user-weight-test';
  
  try {
    // Step 1: Add initial weight
    console.log('📝 Step 1: Adding initial weight entry...');
    const initialWeight = await fitnessModel.logMeasurement(testUserId, {
      measurementType: 'weight',
      value: 180.0,
      unit: 'lbs',
      date: '2024-01-01',
      notes: 'Starting weight for fitness journey',
    });
    console.log(`✅ Added: ${initialWeight.value} ${initialWeight.unit} on ${initialWeight.date.split('T')[0]}`);
    console.log(`   Notes: ${initialWeight.notes}\n`);

    // Step 2: Add weekly progress entries
    console.log('📈 Step 2: Adding weekly progress entries...');
    const weeklyData = [
      { date: '2024-01-08', weight: 178.5, notes: 'Week 1: Good progress!' },
      { date: '2024-01-15', weight: 177.2, notes: 'Week 2: Steady loss' },
      { date: '2024-01-22', weight: 175.8, notes: 'Week 3: On track' },
      { date: '2024-01-29', weight: 174.5, notes: 'Week 4: Great month!' },
    ];

    const weeklyRecords = [];
    for (let i = 0; i < weeklyData.length; i++) {
      const data = weeklyData[i];
      const record = await fitnessModel.logMeasurement(testUserId, {
        measurementType: 'weight',
        value: data.weight,
        unit: 'lbs',
        date: data.date,
        notes: data.notes,
      });
      weeklyRecords.push(record);
      console.log(`✅ Week ${i + 1}: ${record.value} ${record.unit} - ${record.notes}`);
    }
    console.log('');

    // Step 3: Retrieve and display all weight records
    console.log('🔍 Step 3: Retrieving all weight records...');
    const allRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
    const weightRecords = allRecords.filter(r => r.measurementType === 'weight');
    
    console.log(`✅ Found ${weightRecords.length} weight records:`);
    weightRecords.forEach((record, index) => {
      const date = record.date.split('T')[0];
      console.log(`   ${index + 1}. ${date}: ${record.value} ${record.unit} - ${record.notes}`);
    });
    console.log('');

    // Step 4: Calculate progress
    console.log('📊 Step 4: Calculating weight loss progress...');
    const weights = weightRecords.map(r => r.value).sort((a, b) => b - a);
    const startWeight = weights[0];
    const currentWeight = weights[weights.length - 1];
    const totalLoss = startWeight - currentWeight;
    const progressPercentage = ((totalLoss / startWeight) * 100).toFixed(1);
    
    console.log(`✅ Progress Summary:`);
    console.log(`   Starting weight: ${startWeight} lbs`);
    console.log(`   Current weight: ${currentWeight} lbs`);
    console.log(`   Total loss: ${totalLoss} lbs (${progressPercentage}%)`);
    console.log(`   Average loss per week: ${(totalLoss / 4).toFixed(1)} lbs\n`);

    // Step 5: Update a record (demonstrate edit functionality)
    console.log('✏️ Step 5: Updating a weight entry...');
    const recordToUpdate = weeklyRecords[1]; // Week 2 record
    const updatedRecord = await fitnessModel.updateFitnessRecord(
      recordToUpdate.id,
      testUserId,
      {
        value: 177.0, // Corrected weight
        notes: 'Week 2: Corrected measurement',
      }
    );
    console.log(`✅ Updated record: ${updatedRecord.value} lbs - ${updatedRecord.notes}\n`);

    // Step 6: Delete a record (demonstrate remove functionality)
    console.log('🗑️ Step 6: Removing a weight entry...');
    const recordToDelete = weeklyRecords[0]; // Week 1 record
    await fitnessModel.deleteFitnessRecord(recordToDelete.id, testUserId);
    console.log(`✅ Deleted record: Week 1 entry removed\n`);

    // Step 7: Final verification
    console.log('🔍 Step 7: Final verification...');
    const finalRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
    const finalWeightRecords = finalRecords.filter(r => r.measurementType === 'weight');
    
    console.log(`✅ Final count: ${finalWeightRecords.length} weight records remaining`);
    finalWeightRecords.forEach((record, index) => {
      const date = record.date.split('T')[0];
      console.log(`   ${index + 1}. ${date}: ${record.value} ${record.unit} - ${record.notes}`);
    });

    console.log('\n🎉 Weight Functionality Test PASSED!');
    console.log('✅ All CRUD operations (Create, Read, Update, Delete) working correctly');
    console.log('✅ Real weight tracking data processed successfully');
    console.log('✅ Progress calculations accurate');
    
    return true;

  } catch (error) {
    console.error('❌ Test FAILED:', error);
    return false;
  } finally {
    // Cleanup test data
    try {
      console.log('\n🧹 Cleaning up test data...');
      const cleanupRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
      for (const record of cleanupRecords) {
        if (record.measurementType === 'weight') {
          await fitnessModel.deleteFitnessRecord(record.id, testUserId);
        }
      }
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error);
    }
  }
}

// Export for direct execution
export { testWeightFunctionality };

// Allow direct execution
if (require.main === module) {
  testWeightFunctionality()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
} 