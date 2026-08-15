import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, runTransaction, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  rewardCoins: number;
  timestamp: string;
}

export interface Milestone {
  id: string;
  targetCount: number;
  rewardCoins: number;
  title: string;
  description: string;
  iconUrl: string;
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  avatar?: string;
  referralsCount: number;
  earnedCoins: number;
  isCurrentUser?: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'm-3',
    targetCount: 3,
    rewardCoins: 500,
    title: 'Bronze Recruiter',
    description: 'Invite 3 friends to claim 500 Stars',
    iconUrl: 'https://i.suar.me/jvn9x/l'
  },
  {
    id: 'm-5',
    targetCount: 5,
    rewardCoins: 1000,
    title: 'Silver Networker',
    description: 'Invite 5 friends to claim 1,000 Stars',
    iconUrl: 'https://i.suar.me/dgPj1/l'
  },
  {
    id: 'm-10',
    targetCount: 10,
    rewardCoins: 2500,
    title: 'Gold Ambassador',
    description: 'Invite 10 friends to claim 2,500 Stars',
    iconUrl: 'https://i.suar.me/8zYaV/l'
  },
  {
    id: 'm-25',
    targetCount: 25,
    rewardCoins: 7000,
    title: 'Diamond Vault Master',
    description: 'Invite 25 friends to claim 7,000 Stars',
    iconUrl: 'https://i.suar.me/LpwLx/l'
  }
];

export const WELCOME_BONUS = 100;
export const REFERRER_REWARD = 250;
export const BOT_USERNAME = 'GiftsVault_bot';

// Fallback leaderboard for empty states
const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { userId: 'top-1', name: 'Ahmed_DXB', referralsCount: 250, earnedCoins: 62500 },
  { userId: 'top-2', name: 'Omar_KSA', referralsCount: 189, earnedCoins: 47250 },
  { userId: 'top-3', name: 'Faisal_VIP', referralsCount: 145, earnedCoins: 36250 },
  { userId: 'top-4', name: 'Zayd_Crypto', referralsCount: 112, earnedCoins: 28000 },
  { userId: 'top-5', name: 'Khalid_Ton', referralsCount: 88, earnedCoins: 22000 },
  { userId: 'top-6', name: 'Tariq_NFT', referralsCount: 64, earnedCoins: 16000 },
  { userId: 'top-7', name: 'Youssef_Gram', referralsCount: 41, earnedCoins: 10250 },
  { userId: 'top-8', name: 'Nasser_Dubai', referralsCount: 28, earnedCoins: 7000 },
];

export const referralService = {
  getBotUsername: () => BOT_USERNAME,
  
  getReferralLink: (userId: string) => {
    return `https://t.me/${BOT_USERNAME}?startapp=ref_${userId}`;
  },
  
  getShareUrl: (userId: string) => {
    const link = referralService.getReferralLink(userId);
    const text = "🎁 Join GiftsVault to trade Telegram Gifts & earn 100 App Stars welcome bonus!";
    return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
  },

  // Ensure authenticated
  ensureAuth: async () => {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  },

  // Get user ref stats
  getUserReferralStats: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          referralsCount: data.referralsCount || 0,
          earnedCoins: data.earnedCoins || 0,
          claimedMilestones: (data.claimedMilestones || []) as string[],
          referredBy: data.referredBy || null,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return { referralsCount: 0, earnedCoins: 0, claimedMilestones: [], referredBy: null };
  },

  // Process referral on launch (Async)
  processReferralOnLaunch: async (currentUserId: string, currentUserName?: string): Promise<{ success: boolean; welcomeBonus: number }> => {
    try {
      await referralService.ensureAuth();
      
      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);
      
      let alreadyReferred = false;
      if (userSnap.exists() && userSnap.data().referredBy) {
        alreadyReferred = true;
      }

      // Check URL for startapp
      let rawParam: string | null = null;
      if (typeof window !== 'undefined') {
        const tgWebApp = (window as any).Telegram?.WebApp;
        if (tgWebApp?.initDataUnsafe?.start_param) {
          rawParam = tgWebApp.initDataUnsafe.start_param;
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          rawParam = urlParams.get('startapp') || urlParams.get('ref') || urlParams.get('start');
        }
      }

      if (!rawParam || alreadyReferred) return { success: false, welcomeBonus: 0 };

      // Clean prefix "ref_"
      const referrerId = rawParam.replace(/^ref_/, '').trim();
      
      if (!referrerId || referrerId === currentUserId) {
        return { success: false, welcomeBonus: 0 };
      }

      // Run Transaction to update both safely
      await runTransaction(db, async (transaction) => {
        const referrerRef = doc(db, 'users', referrerId);
        const referrerSnap = await transaction.get(referrerRef);
        
        let newRefCount = 1;
        let newEarnedCoins = REFERRER_REWARD;
        
        if (referrerSnap.exists()) {
          newRefCount = (referrerSnap.data().referralsCount || 0) + 1;
          newEarnedCoins = (referrerSnap.data().earnedCoins || 0) + REFERRER_REWARD;
          transaction.update(referrerRef, {
            referralsCount: newRefCount,
            earnedCoins: newEarnedCoins,
            starsBalance: (referrerSnap.data().starsBalance || 0) + REFERRER_REWARD
          });
        } else {
          // If referrer doesn't exist, theoretically we can create it
          transaction.set(referrerRef, {
            uid: referrerId,
            referralsCount: newRefCount,
            earnedCoins: newEarnedCoins,
            starsBalance: REFERRER_REWARD,
            createdAt: serverTimestamp()
          });
        }

        if (userSnap.exists()) {
          transaction.update(userRef, {
            referredBy: referrerId,
            starsBalance: (userSnap.data().starsBalance || 0) + WELCOME_BONUS
          });
        } else {
          transaction.set(userRef, {
            uid: currentUserId,
            displayName: currentUserName || `User ${currentUserId.slice(-4)}`,
            referredBy: referrerId,
            starsBalance: WELCOME_BONUS,
            createdAt: serverTimestamp()
          });
        }

        // Add referral log
        const newRefLogRef = doc(collection(db, 'referrals'));
        transaction.set(newRefLogRef, {
          referrerId,
          referredUserId: currentUserId,
          referredUserName: currentUserName || `User ${currentUserId.slice(-4)}`,
          bonusEarned: REFERRER_REWARD,
          createdAt: serverTimestamp()
        });
      });

      return { success: true, welcomeBonus: WELCOME_BONUS };
    } catch (err) {
      console.error('Error processing referral:', err);
      return { success: false, welcomeBonus: 0 };
    }
  },

  getReferredFriends: async (userId: string): Promise<ReferralRecord[]> => {
    try {
      const q = query(
        collection(db, 'referrals'),
        where('referrerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snaps = await getDocs(q);
      return snaps.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          referrerId: d.referrerId,
          referredId: d.referredUserId,
          referredName: d.referredUserName,
          rewardCoins: d.bonusEarned,
          timestamp: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  claimMilestone: async (userId: string, milestoneId: string): Promise<{ success: boolean; rewardCoins: number }> => {
    try {
      const milestone = MILESTONES.find(m => m.id === milestoneId);
      if (!milestone) return { success: false, rewardCoins: 0 };

      return await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) return { success: false, rewardCoins: 0 };
        
        const data = userSnap.data();
        const currentClaimed = (data.claimedMilestones || []) as string[];
        
        if ((data.referralsCount || 0) < milestone.targetCount) {
          return { success: false, rewardCoins: 0 };
        }
        if (currentClaimed.includes(milestoneId)) {
          return { success: false, rewardCoins: 0 };
        }

        const newClaimed = [...currentClaimed, milestoneId];
        transaction.update(userRef, {
          claimedMilestones: newClaimed,
          starsBalance: (data.starsBalance || 0) + milestone.rewardCoins
        });

        return { success: true, rewardCoins: milestone.rewardCoins };
      });
    } catch (e) {
      console.error(e);
      return { success: false, rewardCoins: 0 };
    }
  },

  getWeeklyLeaderboard: async (currentUserId: string, currentUserName?: string): Promise<LeaderboardUser[]> => {
    try {
      const q = query(collection(db, 'users'), orderBy('referralsCount', 'desc'), limit(50));
      const snaps = await getDocs(q);
      
      let board: LeaderboardUser[] = snaps.docs
        .filter(d => (d.data().referralsCount || 0) > 0)
        .map(d => ({
          userId: d.id,
          name: d.data().displayName || d.id,
          referralsCount: d.data().referralsCount || 0,
          earnedCoins: d.data().earnedCoins || 0,
          isCurrentUser: d.id === currentUserId
        }));

      // Always merge INITIAL_LEADERBOARD to ensure it looks active
      const simulatedUsers = [...INITIAL_LEADERBOARD];
      
      // Prevent duplicates if by some chance they exist
      for (const simUser of simulatedUsers) {
        if (!board.find(u => u.userId === simUser.userId)) {
          board.push(simUser);
        }
      }

      const myStats = await referralService.getUserReferralStats(currentUserId);
      const existingIndex = board.findIndex(u => u.userId === currentUserId);
      const currentUserEntry: LeaderboardUser = {
        userId: currentUserId,
        name: currentUserName || `You (@${currentUserId.slice(-4)})`,
        referralsCount: myStats.referralsCount,
        earnedCoins: myStats.earnedCoins,
        isCurrentUser: true,
      };

      if (existingIndex !== -1) {
        board[existingIndex] = currentUserEntry;
      } else {
        board.push(currentUserEntry);
      }

      return board.sort((a, b) => b.referralsCount - a.referralsCount || b.earnedCoins - a.earnedCoins).slice(0, 50);
    } catch (e) {
      console.error(e);
      return [...INITIAL_LEADERBOARD];
    }
  }
};
