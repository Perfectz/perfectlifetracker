import { z } from 'zod';

// Enum for habit frequency options
export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

// Base habit schema used for validation
export const habitSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  frequency: z.nativeEnum(HabitFrequency, { 
    errorMap: () => ({ message: 'Please select a valid frequency' })
  }),
  description: z.string().optional(),
  streak: z.number().min(0).optional(),
});

// Schema used for creating a new habit (matches API's CreateHabitRequest)
export const createHabitSchema = habitSchema;

// Schema used for updating an existing habit
export const updateHabitSchema = habitSchema.partial();

// Type definitions based on schemas
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

// Default values for new habits
export const defaultHabitValues: CreateHabitInput = {
  name: '',
  frequency: HabitFrequency.DAILY,
  description: '',
  streak: 0
}; 