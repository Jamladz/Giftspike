const fs = require('fs');
let code = fs.readFileSync('src/lib/referral.ts', 'utf8');

const initialRegex = /const INITIAL_LEADERBOARD: LeaderboardUser\[\] = \[.*?\];/s;
const newInitial = `const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { userId: 'top-1', name: 'Ahmed_DXB', referralsCount: 250, earnedCoins: 62500 },
  { userId: 'top-2', name: 'Omar_KSA', referralsCount: 189, earnedCoins: 47250 },
  { userId: 'top-3', name: 'Faisal_VIP', referralsCount: 145, earnedCoins: 36250 },
  { userId: 'top-4', name: 'Zayd_Crypto', referralsCount: 112, earnedCoins: 28000 },
  { userId: 'top-5', name: 'Khalid_Ton', referralsCount: 88, earnedCoins: 22000 },
  { userId: 'top-6', name: 'Tariq_NFT', referralsCount: 64, earnedCoins: 16000 },
  { userId: 'top-7', name: 'Youssef_Gram', referralsCount: 41, earnedCoins: 10250 },
  { userId: 'top-8', name: 'Nasser_Dubai', referralsCount: 28, earnedCoins: 7000 },
];`;

code = code.replace(initialRegex, newInitial);

const boardLogicRegex = /      if \(board\.length === 0\) \{[\s\S]*?      return board\.sort\(\(a, b\) => b\.referralsCount - a\.referralsCount \|\| b\.earnedCoins - a\.earnedCoins\);/s;

const newBoardLogic = `      // Always merge INITIAL_LEADERBOARD to ensure it looks active
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
        name: currentUserName || \`You (@\${currentUserId.slice(-4)})\`,
        referralsCount: myStats.referralsCount,
        earnedCoins: myStats.earnedCoins,
        isCurrentUser: true,
      };

      if (existingIndex !== -1) {
        board[existingIndex] = currentUserEntry;
      } else {
        board.push(currentUserEntry);
      }

      return board.sort((a, b) => b.referralsCount - a.referralsCount || b.earnedCoins - a.earnedCoins).slice(0, 50);`;

code = code.replace(boardLogicRegex, newBoardLogic);

fs.writeFileSync('src/lib/referral.ts', code);
console.log("Replaced successfully!");
