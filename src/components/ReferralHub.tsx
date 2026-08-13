import React, { useState, useEffect } from 'react';
import { 
  Users, Copy, Check, Share2, Sparkles, Trophy, Star, Gift, 
  Crown, Flame, Clock, ChevronRight, Award, Zap, ShieldCheck 
} from 'lucide-react';
import { referralService, MILESTONES, Milestone, LeaderboardUser, ReferralRecord } from '../lib/referral';
import { DynamicNumber } from './DynamicNumber';
import WebApp from '@twa-dev/sdk';

interface ReferralHubProps {
  userId: string;
  userStars: number;
  onEarnStars: (amount: number) => void;
}

export function ReferralHub({ userId, userStars, onEarnStars }: ReferralHubProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'milestones' | 'friends' | 'leaderboard'>('invite');
  const [stats, setStats] = useState(() => referralService.getUserReferralStats(userId));
  const [friends, setFriends] = useState<ReferralRecord[]>(() => referralService.getReferredFriends(userId));
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Weekly Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const currentUserName = WebApp.initDataUnsafe?.user?.first_name || `User @${userId.slice(-4)}`;
  const referralLink = referralService.getReferralLink(userId);

  useEffect(() => {
    // Refresh stats and friends list
    const currentStats = referralService.getUserReferralStats(userId);
    setStats(currentStats);
    setFriends(referralService.getReferredFriends(userId));
    setLeaderboard(referralService.getWeeklyLeaderboard(userId, currentUserName));

    // Weekly countdown logic to Sunday 23:59:59 UTC
    const updateCountdown = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 is Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      
      const nextSunday = new Date(now);
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      nextSunday.setUTCHours(23, 59, 59, 999);

      const diff = nextSunday.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [userId, currentUserName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareUrl = referralService.getShareUrl(userId);
    if (WebApp.openTelegramLink) {
      WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const handleClaimMilestone = (milestoneId: string) => {
    const result = referralService.claimMilestone(userId, milestoneId);
    if (result.success && result.rewardCoins > 0) {
      onEarnStars(result.rewardCoins);
      setStats(referralService.getUserReferralStats(userId));
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Compact Hero Banner */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-xl overflow-hidden group">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.suar.me/g46m5/l" 
            alt="Referral Banner" 
            className="w-full h-full object-cover object-center brightness-70 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0F]/95 via-[#0C0C0F]/85 to-[#0C0C0F]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0F] via-transparent to-black/40" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/40 text-amber-300 text-[10px] font-black tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>INVITE & EARN</span>
            </div>

            <div className="bg-black/60 backdrop-blur-xl px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] text-neutral-300 font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-400" />
              <span>{stats.referralsCount} Friends</span>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
              Invite Friends, Earn Up To <span className="text-amber-400">7,000 Stars</span>
            </h2>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-tight">
              Get <strong className="text-amber-300">250 Stars</strong> per referral. Your friend receives <strong className="text-amber-300">100 Stars</strong> welcome bonus!
            </p>
          </div>

          {/* Compact Referral Link & Share Row */}
          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-xl p-1.5 border border-white/10 flex items-center justify-between px-2.5">
              <span className="text-[11px] text-neutral-300 font-mono truncate max-w-[200px] sm:max-w-xs">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={handleShare}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Compact Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'invite', label: 'Invite Hub', icon: Zap },
          { id: 'milestones', label: 'Milestones', icon: Trophy },
          { id: 'leaderboard', label: 'Weekly Sprint', icon: Crown },
          { id: 'friends', label: `Friends (${friends.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[85px] py-1.5 px-2.5 rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer select-none whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: INVITE HUB & QUICK STATS */}
      {activeTab === 'invite' && (
        <div className="space-y-3">
          {/* Mini Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#18181B] p-3 rounded-xl border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full blur-lg" />
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-medium mb-1">
                <span>Total Invited</span>
                <Users className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl font-black text-white">
                {stats.referralsCount} <span className="text-[10px] font-normal text-neutral-400">Friends</span>
              </div>
            </div>

            <div className="bg-[#18181B] p-3 rounded-xl border border-amber-500/20 flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-amber-500/40 transition-all">
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-full blur-lg" />
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-medium mb-1">
                <span>Stars Earned</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              </div>
              <div className="text-xl font-black text-amber-400 flex items-center gap-1">
                <DynamicNumber value={stats.earnedCoins} imageClassName="h-4" />
              </div>
            </div>
          </div>

          {/* Compact How Referral Works Card */}
          <div className="bg-[#18181B] rounded-xl p-3.5 border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>How It Works</span>
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2.5 bg-[#121215] p-2 rounded-lg border border-white/5">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">1</div>
                <div className="flex-1">
                  <p className="font-bold text-white leading-tight">Send Your Invite Link</p>
                  <p className="text-neutral-400 text-[10px]">Share link with friends or Telegram chats.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#121215] p-2 rounded-lg border border-white/5">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-bold text-white leading-tight">Friend Joins & Gets Gift</p>
                  <p className="text-neutral-400 text-[10px]">Friend opens GiftsVault & gets 100 Stars!</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-[#121215] p-2 rounded-lg border border-white/5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">3</div>
                <div className="flex-1">
                  <p className="font-bold text-white leading-tight">Earn 250 Stars + Milestone Bonuses</p>
                  <p className="text-neutral-400 text-[10px]">Get instant 250 Stars & unlock VIP milestones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-2.5">
          <div className="bg-[#18181B] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-neutral-400 font-medium">Current Progress</p>
              <h3 className="text-sm font-black text-white">{stats.referralsCount} Invites Total</h3>
            </div>
            <div className="bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.claimedMilestones.length} / {MILESTONES.length} Unlocked</span>
            </div>
          </div>

          {MILESTONES.map((m) => {
            const isCompleted = stats.referralsCount >= m.targetCount;
            const isClaimed = stats.claimedMilestones.includes(m.id);
            const progressPct = Math.min(100, Math.round((stats.referralsCount / m.targetCount) * 100));

            return (
              <div 
                key={m.id}
                className={`bg-[#18181B] rounded-xl p-3 border transition-all ${
                  isClaimed 
                    ? 'border-emerald-500/30 opacity-75' 
                    : isCompleted 
                    ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={m.iconUrl} 
                      alt={m.title} 
                      className={`w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-md transition-all ${
                        isCompleted ? 'opacity-100 scale-105' : 'opacity-70 grayscale-[30%]'
                      }`} 
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{m.title}</h4>
                      <p className="text-[10px] text-neutral-400 leading-tight">{m.description}</p>
                    </div>
                  </div>

                  {/* Rewards Badge */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 text-amber-400 font-black text-xs justify-end">
                      <span>+{m.rewardCoins}</span>
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Compact Progress bar */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2.5">
                  <div className="flex-1 bg-[#121215] h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 shrink-0">
                    {stats.referralsCount} / {m.targetCount}
                  </span>

                  {/* Action button */}
                  {isClaimed ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" /> Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimMilestone(m.id)}
                      className="bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black px-3 py-1 rounded-lg shadow transition-all active:scale-95 cursor-pointer shrink-0 animate-pulse"
                    >
                      Claim!
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-white/5 text-neutral-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg cursor-not-allowed shrink-0"
                    >
                      Locked
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT 3: WEEKLY LEADERBOARD CONTEST */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          {/* Real Countdown & Weekly Contest Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-[#18181B] to-purple-500/15 rounded-xl p-3 sm:p-4 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">Weekly Referral Sprint</h3>
              </div>

              <div className="flex items-center gap-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/30 text-[10px] font-bold text-amber-400">
                <Clock className="w-3 h-3" />
                <span>
                  {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Top 3 Weekly Prizes Showcase */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {/* 1st Place Prize */}
              <div className="bg-gradient-to-b from-amber-500/20 to-black/60 rounded-lg p-2 border border-amber-500/40 text-center flex flex-col items-center">
                <span className="text-[10px] font-black text-amber-300">🥇 1st Place</span>
                <span className="text-xs font-black text-amber-400 mt-0.5">10,000 Stars</span>
                <div className="flex items-center gap-1 text-[9px] text-neutral-300 font-mono mt-0.5">
                  <span>+</span>
                  <DynamicNumber value={100} imageClassName="h-2.5" />
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
                </div>
              </div>

              {/* 2nd Place Prize */}
              <div className="bg-gradient-to-b from-slate-400/20 to-black/60 rounded-lg p-2 border border-slate-400/40 text-center flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300">🥈 2nd Place</span>
                <span className="text-xs font-black text-slate-200 mt-0.5">5,000 Stars</span>
                <div className="flex items-center gap-1 text-[9px] text-neutral-300 font-mono mt-0.5">
                  <span>+</span>
                  <DynamicNumber value={50} imageClassName="h-2.5" />
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
                </div>
              </div>

              {/* 3rd Place Prize */}
              <div className="bg-gradient-to-b from-amber-700/20 to-black/60 rounded-lg p-2 border border-amber-700/40 text-center flex flex-col items-center">
                <span className="text-[10px] font-black text-amber-500">🥉 3rd Place</span>
                <span className="text-xs font-black text-amber-400 mt-0.5">2,500 Stars</span>
                <div className="flex items-center gap-1 text-[9px] text-neutral-300 font-mono mt-0.5">
                  <span>+</span>
                  <DynamicNumber value={25} imageClassName="h-2.5" />
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-[#18181B] rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
            {leaderboard.map((user, index) => {
              const rank = index + 1;

              return (
                <div 
                  key={user.userId} 
                  className={`flex items-center justify-between p-2.5 px-3 transition-all ${
                    user.isCurrentUser 
                      ? 'bg-blue-500/15 border-l-2 border-l-blue-400 font-bold' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Rank Badge */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                      rank === 1 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                      rank === 2 ? 'bg-slate-400/30 text-slate-200 border border-slate-400/50' :
                      rank === 3 ? 'bg-amber-700/30 text-amber-400 border border-amber-700/50' :
                      'bg-white/5 text-neutral-400'
                    }`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{user.name}</span>
                        {user.isCurrentUser && (
                          <span className="text-[8px] font-black uppercase bg-blue-500 text-white px-1 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-neutral-400 font-mono">
                        {user.referralsCount} invites
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-amber-400 text-xs">
                    <DynamicNumber value={user.earnedCoins} imageClassName="h-3.5" />
                    <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: MY REFERRED FRIENDS */}
      {activeTab === 'friends' && (
        <div className="space-y-2.5">
          {friends.length === 0 ? (
            <div className="bg-[#18181B] rounded-xl p-6 border border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-2">
                👥
              </div>
              <h4 className="text-xs font-bold text-white">No Friends Invited Yet</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xs mb-3">
                Share your invite link with friends to start earning 250 App Stars for every referral!
              </p>
              <button
                onClick={handleShare}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Invite First Friend</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#18181B] rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {friends.map((f) => (
                <div key={f.id} className="p-2.5 px-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {f.referredName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{f.referredName}</p>
                      <p className="text-[9.5px] text-neutral-400">
                        Joined {new Date(f.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <span>+{f.rewardCoins}</span>
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
