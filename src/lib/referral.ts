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

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { userId: 'top-1', name: 'Alex_TON', referralsCount: 42, earnedCoins: 10500 },
  { userId: 'top-2', name: 'Satoshi_Gifts', referralsCount: 35, earnedCoins: 8750 },
  { userId: 'top-3', name: 'CryptoWhale', referralsCount: 29, earnedCoins: 7250 },
  { userId: 'top-4', name: 'Elena_K', referralsCount: 19, earnedCoins: 4750 },
  { userId: 'top-5', name: 'GramKing', referralsCount: 14, earnedCoins: 3500 },
  { userId: 'top-6', name: 'Pavel_V', referralsCount: 8, earnedCoins: 2000 },
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

  // Process referral on app load
  processReferralOnLaunch: (currentUserId: string, currentUserName?: string): { success: boolean; welcomeBonus: number } => {
    try {
      // 1. Check if user already processed a referral
      const userRefData = JSON.parse(localStorage.getItem(`user_ref_${currentUserId}`) || '{}');
      if (userRefData.referredBy) {
        return { success: false, welcomeBonus: 0 };
      }

      // 2. Extract referrerId from Telegram start_param or URL query parameters
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

      if (!rawParam) return { success: false, welcomeBonus: 0 };

      // Clean prefix "ref_"
      const referrerId = rawParam.replace(/^ref_/, '').trim();

      // Validate: non-empty & not self-referral
      if (!referrerId || referrerId === currentUserId) {
        return { success: false, welcomeBonus: 0 };
      }

      // 3. Mark current user as referred
      userRefData.referredBy = referrerId;
      localStorage.setItem(`user_ref_${currentUserId}`, JSON.stringify(userRefData));

      // 4. Update Referrer's record & referrals count
      const referrerData = JSON.parse(localStorage.getItem(`user_ref_${referrerId}`) || '{}');
      const currentRefCount = referrerData.referralsCount || 0;
      const currentEarned = referrerData.earnedCoins || 0;

      referrerData.referralsCount = currentRefCount + 1;
      referrerData.earnedCoins = currentEarned + REFERRER_REWARD;
      localStorage.setItem(`user_ref_${referrerId}`, JSON.stringify(referrerData));

      // 5. Add to referrals collection log
      const allReferrals: ReferralRecord[] = JSON.parse(localStorage.getItem('global_referrals_log') || '[]');
      const newRecord: ReferralRecord = {
        id: `ref-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        referrerId,
        referredId: currentUserId,
        referredName: currentUserName || `User ${currentUserId.slice(-4)}`,
        rewardCoins: REFERRER_REWARD,
        timestamp: new Date().toISOString()
      };
      allReferrals.push(newRecord);
      localStorage.setItem('global_referrals_log', JSON.stringify(allReferrals));

      return { success: true, welcomeBonus: WELCOME_BONUS };
    } catch (err) {
      console.error('Error processing referral:', err);
      return { success: false, welcomeBonus: 0 };
    }
  },

  getUserReferralStats: (userId: string) => {
    const data = JSON.parse(localStorage.getItem(`user_ref_${userId}`) || '{}');
    return {
      referralsCount: data.referralsCount || 0,
      earnedCoins: data.earnedCoins || 0,
      claimedMilestones: (data.claimedMilestones || []) as string[],
      referredBy: data.referredBy || null,
    };
  },

  getReferredFriends: (userId: string): ReferralRecord[] => {
    const allLogs: ReferralRecord[] = JSON.parse(localStorage.getItem('global_referrals_log') || '[]');
    return allLogs
      .filter(r => r.referrerId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  claimMilestone: (userId: string, milestoneId: string): { success: boolean; rewardCoins: number } => {
    const stats = referralService.getUserReferralStats(userId);
    const milestone = MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return { success: false, rewardCoins: 0 };

    if (stats.referralsCount < milestone.targetCount) {
      return { success: false, rewardCoins: 0 };
    }

    if (stats.claimedMilestones.includes(milestoneId)) {
      return { success: false, rewardCoins: 0 };
    }

    const updatedClaimed = [...stats.claimedMilestones, milestoneId];
    const userRefData = JSON.parse(localStorage.getItem(`user_ref_${userId}`) || '{}');
    userRefData.claimedMilestones = updatedClaimed;
    localStorage.setItem(`user_ref_${userId}`, JSON.stringify(userRefData));

    return { success: true, rewardCoins: milestone.rewardCoins };
  },

  getWeeklyLeaderboard: (currentUserId: string, currentUserName?: string): LeaderboardUser[] => {
    const myStats = referralService.getUserReferralStats(currentUserId);
    let board = [...INITIAL_LEADERBOARD];

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

    return board.sort((a, b) => b.referralsCount - a.referralsCount || b.earnedCoins - a.earnedCoins);
  }
};
