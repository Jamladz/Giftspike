import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const userService = {
  ensureAuth: async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  },
  
  syncUser: async (userId: string, userName: string) => {
    try {
      await userService.ensureAuth();
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userId,
          displayName: userName,
          gramBalance: 0,
          starsBalance: 150, // Starter stars
          createdAt: new Date().toISOString()
        });
        return { gramBalance: 0, starsBalance: 150 };
      } else {
        const data = userSnap.data();
        return {
          gramBalance: data.gramBalance || 0,
          starsBalance: data.starsBalance || 0
        };
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  updateBalance: async (userId: string, updates: { gramBalance?: number; starsBalance?: number }) => {
    try {
      await userService.ensureAuth();
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (e) {
      console.error(e);
    }
  }
};
