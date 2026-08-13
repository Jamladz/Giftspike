export interface RegisteredTelegramUser {
  id: string;
  username: string;
  first_name: string;
  last_seen: string;
  userGram: number;
  userStars: number;
  giftsCount: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  first_name: string;
  amount: number;
  walletAddress: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  txHash?: string;
  notes?: string;
}

const USERS_KEY = 'app_telegram_users';
const WITHDRAWALS_KEY = 'app_withdrawals';
const ADMIN_FREE_MODE_KEY = 'app_admin_free_mode';

export const adminService = {
  // Track or update a user when they launch/use the Mini App
  registerOrUpdateUser: (userData: { id: string; username?: string; first_name?: string; userGram?: number; userStars?: number; giftsCount?: number }) => {
    try {
      const saved = localStorage.getItem(USERS_KEY);
      let users: RegisteredTelegramUser[] = saved ? JSON.parse(saved) : [];

      if (users.length === 0) {
        users = [
          { id: '109283741', username: 'sekanedr_is', first_name: 'Sekanedr', last_seen: new Date().toISOString(), userGram: 250, userStars: 1500, giftsCount: 3 },
          { id: '984721029', username: 'crypto_alex', first_name: 'Alex Trader', last_seen: new Date(Date.now() - 3600000).toISOString(), userGram: 45.5, userStars: 320, giftsCount: 1 },
          { id: '873210492', username: 'ton_whale', first_name: 'Sami', last_seen: new Date(Date.now() - 7200000).toISOString(), userGram: 120, userStars: 800, giftsCount: 2 },
          { id: '721094821', username: 'nadia_tg', first_name: 'Nadia', last_seen: new Date(Date.now() - 86400000).toISOString(), userGram: 12.0, userStars: 150, giftsCount: 0 },
        ];
      }

      const existingIndex = users.findIndex((u) => u.id === userData.id || (userData.username && u.username?.toLowerCase() === userData.username.toLowerCase()));

      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        users[existingIndex] = {
          ...users[existingIndex],
          username: userData.username || users[existingIndex].username || `user_${userData.id.slice(-4)}`,
          first_name: userData.first_name || users[existingIndex].first_name,
          last_seen: now,
          userGram: userData.userGram !== undefined ? userData.userGram : users[existingIndex].userGram,
          userStars: userData.userStars !== undefined ? userData.userStars : users[existingIndex].userStars,
          giftsCount: userData.giftsCount !== undefined ? userData.giftsCount : users[existingIndex].giftsCount,
        };
      } else {
        users.unshift({
          id: userData.id,
          username: userData.username || `user_${userData.id.slice(-4)}`,
          first_name: userData.first_name || 'Telegram User',
          last_seen: now,
          userGram: userData.userGram || 0,
          userStars: userData.userStars || 150,
          giftsCount: userData.giftsCount || 0,
        });
      }

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to update admin users store', e);
    }
  },

  getUsers: (): RegisteredTelegramUser[] => {
    try {
      const saved = localStorage.getItem(USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    const seedUsers: RegisteredTelegramUser[] = [
      { id: '109283741', username: 'sekanedr_is', first_name: 'Sekanedr', last_seen: new Date().toISOString(), userGram: 250, userStars: 1500, giftsCount: 3 },
      { id: '984721029', username: 'crypto_alex', first_name: 'Alex Trader', last_seen: new Date(Date.now() - 3600000).toISOString(), userGram: 45.5, userStars: 320, giftsCount: 1 },
      { id: '873210492', username: 'ton_whale', first_name: 'Sami', last_seen: new Date(Date.now() - 7200000).toISOString(), userGram: 120, userStars: 800, giftsCount: 2 },
      { id: '721094821', username: 'nadia_tg', first_name: 'Nadia', last_seen: new Date(Date.now() - 86400000).toISOString(), userGram: 12.0, userStars: 150, giftsCount: 0 },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  },

  // Record a new withdrawal request
  addWithdrawalRequest: (req: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>): WithdrawalRequest => {
    const saved = localStorage.getItem(WITHDRAWALS_KEY);
    let withdrawals: WithdrawalRequest[] = saved ? JSON.parse(saved) : [];

    const newReq: WithdrawalRequest = {
      ...req,
      id: `wd_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    withdrawals.unshift(newReq);
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
    return newReq;
  },

  getWithdrawals: (): WithdrawalRequest[] => {
    try {
      const saved = localStorage.getItem(WITHDRAWALS_KEY);
      if (saved) {
        const list: WithdrawalRequest[] = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}

    const initialSeed: WithdrawalRequest[] = [
      {
        id: 'wd_seed_101',
        userId: '109283741',
        username: 'sekanedr_is',
        first_name: 'Sekanedr',
        amount: 25.0,
        walletAddress: 'UQCTZAMbXoN5T43K9gJXH8GYWBmIstXrUrdoV9kv3btN1Ad3',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'wd_seed_102',
        userId: '984721029',
        username: 'crypto_alex',
        first_name: 'Alex Trader',
        amount: 10.0,
        walletAddress: 'UQD3aXkL992jXH8GYWBmIstXrUrdoV9kv3btN1Ad39aL',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ];
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(initialSeed));
    return initialSeed;
  },

  updateWithdrawalStatus: (id: string, status: 'APPROVED' | 'REJECTED', txHash?: string, notes?: string): WithdrawalRequest[] => {
    const list = adminService.getWithdrawals();
    const index = list.findIndex((w) => w.id === id);
    if (index >= 0) {
      list[index].status = status;
      if (txHash) list[index].txHash = txHash;
      if (notes) list[index].notes = notes;
      localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(list));
    }
    return list;
  },

  getAdminFreeMode: (): boolean => {
    return localStorage.getItem(ADMIN_FREE_MODE_KEY) === 'true';
  },

  setAdminFreeMode: (enabled: boolean) => {
    localStorage.setItem(ADMIN_FREE_MODE_KEY, enabled ? 'true' : 'false');
  }
};
