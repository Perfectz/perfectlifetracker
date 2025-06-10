import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FitnessModel } from '../models/FitnessModel';

describe('Weight Functionality Integration Tests', () => {
  let fitnessModel: FitnessModel;
  const testUserId = 'test-user-weight-functionality';
  const realWeightData = [
    { date: '2024-01-01', weight: 175.5, notes: 'New Year weight check' },
    { date: '2024-01-08', weight: 174.2, notes: 'Week 1 progress' },
    { date: '2024-01-15', weight: 173.8, notes: 'Week 2 progress' },
    { date: '2024-01-22', weight: 172.5, notes: 'Week 3 progress' },
    { date: '2024-01-29', weight: 171.9, notes: 'Month 1 complete' },
  ];

  beforeAll(async () => {
    fitnessModel = new FitnessModel();
    // Container will be initialized automatically when needed
  });

  beforeEach(async () => {
    try {
      const existingRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
      for (const record of existingRecords) {
        if (record.measurementType === 'weight') {
          await fitnessModel.deleteFitnessRecord(record.id, testUserId);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Add Weight Functionality', () => {
    it('should successfully add a single weight entry', async () => {
      const weightData = realWeightData[0];
      
      const result = await fitnessModel.logMeasurement(testUserId, {
        measurementType: 'weight',
        value: weightData.weight,
        unit: 'lbs',
        date: weightData.date,
        notes: weightData.notes,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe('measurement');
      expect(result.measurementType).toBe('weight');
      expect(result.value).toBe(weightData.weight);
      expect(result.unit).toBe('lbs');
      expect(result.notes).toBe(weightData.notes);
      expect(result.userId).toBe(testUserId);
    });

    it('should successfully add multiple weight entries', async () => {
      const addedRecords = [];

      for (const weightData of realWeightData) {
        const result = await fitnessModel.logMeasurement(testUserId, {
          measurementType: 'weight',
          value: weightData.weight,
          unit: 'lbs',
          date: weightData.date,
          notes: weightData.notes,
        });

        addedRecords.push(result);
        expect(result.value).toBe(weightData.weight);
      }

      expect(addedRecords).toHaveLength(realWeightData.length);
    });
  });

  describe('Retrieve Weight Functionality', () => {
    beforeEach(async () => {
      for (const weightData of realWeightData) {
        await fitnessModel.logMeasurement(testUserId, {
          measurementType: 'weight',
          value: weightData.weight,
          unit: 'lbs',
          date: weightData.date,
          notes: weightData.notes,
        });
      }
    });

    it('should retrieve all weight records for a user', async () => {
      const allRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
      const weightRecords = allRecords.filter(r => r.measurementType === 'weight');

      expect(weightRecords).toHaveLength(realWeightData.length);
      
      for (const originalWeight of realWeightData) {
        const found = weightRecords.find(r => r.value === originalWeight.weight);
        expect(found).toBeDefined();
        expect(found?.notes).toBe(originalWeight.notes);
      }
    });
  });

  describe('Complete Weight Tracking Workflow', () => {
    it('should handle a complete weight tracking scenario', async () => {
      console.log('🏃‍♂️ Starting complete weight tracking workflow test...');

      // Step 1: Add initial weight
      console.log('📝 Step 1: Adding initial weight...');
      const initialWeight = await fitnessModel.logMeasurement(testUserId, {
        measurementType: 'weight',
        value: 180.0,
        unit: 'lbs',
        date: '2024-05-01',
        notes: 'Starting weight for fitness journey',
      });
      expect(initialWeight.value).toBe(180.0);
      console.log(`✅ Added initial weight: ${initialWeight.value} lbs`);

      // Step 2: Add weekly progress entries
      console.log('📈 Step 2: Adding weekly progress...');
      const weeklyWeights = [178.5, 177.2, 175.8, 174.5];
      const weeklyRecords = [];

      for (let i = 0; i < weeklyWeights.length; i++) {
        const record = await fitnessModel.logMeasurement(testUserId, {
          measurementType: 'weight',
          value: weeklyWeights[i],
          unit: 'lbs',
          date: `2024-05-${String((i + 1) * 7 + 1).padStart(2, '0')}`,
          notes: `Week ${i + 1} progress check`,
        });
        weeklyRecords.push(record);
        console.log(`✅ Week ${i + 1}: ${record.value} lbs`);
      }

      // Step 3: Retrieve and verify all records
      console.log('🔍 Step 3: Retrieving all weight records...');
      const allRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
      const weightRecords = allRecords.filter(r => r.measurementType === 'weight');
      
      expect(weightRecords).toHaveLength(5);
      console.log(`✅ Retrieved ${weightRecords.length} weight records`);

      // Step 4: Calculate weight loss
      console.log('📊 Step 4: Calculating progress...');
      const weights = weightRecords.map(r => r.value).filter(w => w != null).sort((a, b) => (b || 0) - (a || 0));
      const startWeight = weights[0] || 0;
      const currentWeight = weights[weights.length - 1] || 0;
      const totalLoss = startWeight - currentWeight;
      
      expect(totalLoss).toBeGreaterThan(0);
      console.log(`✅ Progress: Lost ${totalLoss} lbs (${startWeight} → ${currentWeight})`);

      // Step 5: Delete a record
      console.log('🗑️ Step 5: Removing an entry...');
      if (weeklyRecords.length > 0) {
        await fitnessModel.deleteFitnessRecord(weeklyRecords[0].id, testUserId);
      }
      
      const finalRecords = await fitnessModel.getRecordsByType(testUserId, 'measurement');
      const finalWeightRecords = finalRecords.filter(r => r.measurementType === 'weight');
      
      expect(finalWeightRecords).toHaveLength(4);
      console.log(`✅ Removed entry, ${finalWeightRecords.length} records remaining`);

      console.log('🎉 Complete workflow test passed!');
    });
  });
});
