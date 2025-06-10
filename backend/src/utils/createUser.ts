/**
 * backend/src/utils/createUser.ts
 * Script to create a user account for pzgambo@gmail.com
 */
import UserModel from '../models/UserModel';

async function createUserAccount() {
  try {
    // Check if user already exists
    const existingUser = await UserModel.getUserByEmail('pzgambo@gmail.com');
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return existingUser;
    }

    // Create the user
    const newUser = await UserModel.createUser({
      email: 'pzgambo@gmail.com',
      username: 'pzgambo',
      password: 'Sh0ryuken',
      firstName: 'User',
      lastName: 'Account',
      role: 'admin' // Give admin role for full access
    });

    console.log('User created successfully:', {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createUserAccount()
    .then(() => {
      console.log('User creation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create user:', error);
      process.exit(1);
    });
}

export default createUserAccount; 