import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const userService = {
  ensureAuth: async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  },
  
  syncUser: async (userId: string, tgUser: any) => {
    try {
      await userService.ensureAuth();
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      const tgUsername = tgUser?.username || '';
      const tgFirstName = tgUser?.first_name || '';
      const tgLastName = tgUser?.last_name || '';
      const displayName = typeof tgUser === 'string' ? tgUser : (tgFirstName || tgUsername || 'Unknown');
      
      if (!userSnap.exists()) {
        const initialStars = 3150; // 150 base + 3000 welcome bonus
        await setDoc(userRef, {
          uid: userId,
          displayName: displayName,
          tgUsername: tgUsername,
          tgFirstName: tgFirstName,
          tgLastName: tgLastName,
          gramBalance: 0,
          starsBalance: initialStars, 
          createdAt: new Date().toISOString(),
          welcomeBonusClaimed: true,
          lastLoginAt: new Date().toISOString()
        });
        return { gramBalance: 0, starsBalance: initialStars, isNewUser: true };
      } else {
        const data = userSnap.data();
        let currentStars = data.starsBalance || 0;
        let isNewUser = false;
        
        if (!data.welcomeBonusClaimed) {
           currentStars += 3000;
           isNewUser = true;
           await updateDoc(userRef, {
             starsBalance: currentStars,
             welcomeBonusClaimed: true,
             tgUsername: tgUsername,
             tgFirstName: tgFirstName,
             tgLastName: tgLastName,
             lastLoginAt: new Date().toISOString()
           });
        } else {
           await updateDoc(userRef, {
             tgUsername: tgUsername,
             tgFirstName: tgFirstName,
             tgLastName: tgLastName,
             lastLoginAt: new Date().toISOString()
           });
        }
        
        return {
          gramBalance: data.gramBalance || 0,
          starsBalance: currentStars,
          isNewUser
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
  },

  claimTaskReward: async (userId: string, taskId: string, rewardAmount: number) => {
    try {
      await userService.ensureAuth();
      const userRef = doc(db, 'users', userId);
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User does not exist");
        }
        
        const data = userDoc.data();
        
        if (taskId === 'task-1') {
           const dailyTasks = data.dailyTasks || {};
           const lastClaim = dailyTasks[taskId] || 0;
           const now = Date.now();
           if (now - lastClaim < 24 * 60 * 60 * 1000) {
             return { success: false, reason: 'already_claimed' };
           }
           
           const newStars = (data.starsBalance || 0) + rewardAmount;
           transaction.update(userRef, {
             dailyTasks: { ...dailyTasks, [taskId]: now },
             starsBalance: newStars
           });
           
           return { success: true, newStars };
        } else {
           const completedTasks = data.completedTasks || [];
           
           if (completedTasks.includes(taskId)) {
             return { success: false, reason: 'already_claimed' };
           }
           
           const newStars = (data.starsBalance || 0) + rewardAmount;
           transaction.update(userRef, {
             completedTasks: [...completedTasks, taskId],
             starsBalance: newStars
           });
           
           return { success: true, newStars };
        }
      });
      return result as { success: boolean, newStars?: number, reason?: string };
    } catch (e) {
      console.error(e);
      return { success: false, reason: 'error' };
    }
  }
};
