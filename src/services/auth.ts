import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, createUser, loginWithEmail } from './firebase';

// User roles
export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

// User with role information
export interface UserWithRole {
  uid: string;
  email: string | null;
  role: UserRole;
}

// Create a new user and set their role
export const createUserWithRole = async (email: string, password: string, role: UserRole): Promise<UserWithRole> => {
  try {
    // Create the Firebase auth user
    const userCredential = await createUser(email, password);
    const user = userCredential.user;
    
    // Add user role to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: role,
      createdAt: new Date(),
    });
    
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Login and get user with role
export const loginWithRole = async (email: string, password: string): Promise<UserWithRole> => {
  try {
    const userCredential = await loginWithEmail(email, password);
    const user = userCredential.user;
    const userWithRole = await getUserRole(user);
    return userWithRole;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Get user role from Firestore
export const getUserRole = async (user: User): Promise<UserWithRole> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User role not found');
    }
    
    const userData = userDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      role: userData.role as UserRole
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}; 