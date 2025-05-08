import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, query, where, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration - to be replaced with actual config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication services
export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Data services
export const createTheaterFunction = async (functionData: any) => {
  return addDoc(collection(db, 'theaterFunctions'), {
    ...functionData,
    createdAt: Timestamp.now()
  });
};

export const createTravelingFunction = async (functionData: any) => {
  return addDoc(collection(db, 'travelingFunctions'), {
    ...functionData,
    createdAt: Timestamp.now()
  });
};

export const createReservation = async (functionType: 'theater' | 'traveling', functionId: string, reservationData: any) => {
  const collectionName = functionType === 'theater' ? 'theaterReservations' : 'travelingReservations';
  return addDoc(collection(db, collectionName), {
    ...reservationData,
    functionId,
    createdAt: Timestamp.now()
  });
};

export const getTheaterFunctionsByDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, 'theaterFunctions'), 
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTravelingFunctionsByDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, 'travelingFunctions'), 
    where('date', '>=', startOfDay),
    where('date', '<=', endOfDay)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getReservationsForFunction = async (functionType: 'theater' | 'traveling', functionId: string) => {
  const collectionName = functionType === 'theater' ? 'theaterReservations' : 'travelingReservations';
  const q = query(collection(db, collectionName), where('functionId', '==', functionId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTheaterRooms = async () => {
  const snapshot = await getDocs(collection(db, 'theaterRooms'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createTheaterRoom = async (roomData: any) => {
  return addDoc(collection(db, 'theaterRooms'), roomData);
};

export const deleteTheaterRoom = async (roomId: string) => {
  return deleteDoc(doc(db, 'theaterRooms', roomId));
};

export const updateTheaterRoom = async (roomId: string, roomData: any) => {
  return updateDoc(doc(db, 'theaterRooms', roomId), roomData);
};

export { auth, db }; 