import React, { useState, useEffect } from 'react';
import { adminService, RegisteredTelegramUser, WithdrawalRequest } from '../lib/admin';
import { DynamicNumber } from './DynamicNumber';
import { 
  ShieldCheck, 
  Users, 
  ArrowUpRight, 
  Gift as GiftIcon, 
  Check, 
  X, 
  Copy, 
  Sparkles, 
  Key, 
  ArrowLeft, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Search
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onGrantFreeGift?: (giftId: string) => void;
  userGram: number;
  onUpdateGram: (amount: number) => void;
}

export function AdminDashboard({ onClose, onGrantFreeGift, userGram, onUpdateGram }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'lab'>('withdrawals');
  
  const [users, setUsers] = useState<RegisteredTelegramUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isAdminFreeMode, setIsAdminFreeMode] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    setIsAdminFreeMode(adminService.getAdminFreeMode());
  }, []);

  const loadData = () => {
    setUsers(adminService.getUsers());
    setWithdrawals(adminService.getWithdrawals());
  };

  const handleToggleFreeMode = () => {
    const next = !isAdminFreeMode;
    adminService.setAdminFreeMode(next);
    setIsAdminFreeMode(next);
    showToast(next ? '⚡ Admin Free Testing Mode Activated!' : 'Admin Free Mode Deactivated');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleConfirmWithdrawal = (id: string, walletAddress: string, amount: number) => {
    const txHash = `tx_ton_${Math.random().toString(36).substring(2, 10)}`;
    const updated = adminService.updateWithdrawalStatus(id, 'APPROVED', txHash, 'Confirmed manually by admin @sekanedr_is');
    setWithdrawals(updated);
    showToast(`✅ Confirmed withdrawal of ${amount} GRAM to ${walletAddress.slice(0, 6)}...`);
  };

  const handleRejectWithdrawal = (id: string, amount: number) => {
    const updated = adminService.updateWithdrawalStatus(id, 'REJECTED', undefined, 'Rejected by admin');
    setWithdrawals(updated);
    showToast(`❌ Withdrawal of ${amount} GRAM rejected`);
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesFilter = filterStatus === 'ALL' || w.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      w.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.first_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 sm:backdrop-blur-sm text-[#F5F5F7] overflow-y-auto flex justify-center animate-fadeIn">
      <div className="w-full max-w-[480px] min-h-screen bg-[#0A0A0C] flex flex-col relative sm:border-x border-[#2C2C2E]/40 shadow-2xl">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-blue-400/30 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="sticky top-0 z-30 bg-[#121215]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1">
                  <span>Admin Control Dashboard</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-mono">
                    @sekanedr_is
                  </span>
                </h1>
              </div>
              <p className="text-[10px] text-neutral-400">Telegram Mini App Management & Manual Verification</p>
            </div>
          </div>

          {/* Quick Free Mode Switch */}
          <button
            onClick={handleToggleFreeMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isAdminFreeMode 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {isAdminFreeMode ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">Free Testing:</span>
            <span>{isAdminFreeMode ? 'ON (0 GRAM)' : 'OFF'}</span>
          </button>
        </div>
      </header>

      {/* Body Content */}
      <div className="max-w-4xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-[#161619] p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-400" /> Telegram Users
            </span>
            <div className="text-base sm:text-xl font-black text-white mt-1">
              <DynamicNumber value={users.length} imageClassName="h-4" />
            </div>
          </div>

          <div className="bg-[#161619] p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Pending Withdrawals
            </span>
            <div className="text-base sm:text-xl font-black text-amber-400 mt-1 flex items-center gap-1">
              <DynamicNumber value={pendingCount} imageClassName="h-4" />
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
          </div>

          <div className="bg-[#161619] p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Admin Profile
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-1 truncate">
              @sekanedr_is
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#161619] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdrawals ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>TG Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`py-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'lab'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Testing Lab</span>
          </button>
        </div>

        {/* TAB 1: WITHDRAWALS MANAGEMENT */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#161619] p-1 rounded-xl border border-white/10 overflow-x-auto">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white/15 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending ⏳' : st === 'APPROVED' ? 'Approved ✅' : 'Rejected ❌'}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user or address..."
                  className="w-full bg-[#161619] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Withdrawals List */}
            {filteredWithdrawals.length === 0 ? (
              <div className="bg-[#161619] rounded-2xl p-8 border border-white/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-sm font-bold text-neutral-300">No Withdrawal Requests Found</p>
                <p className="text-xs text-neutral-500">All withdrawal requests appear here for manual review.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredWithdrawals.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#161619] border border-white/10 rounded-2xl p-3.5 space-y-3 shadow-md hover:border-white/20 transition-all"
                  >
                    {/* User & Status Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-400">
                          👤
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{req.first_name}</span>
                            <span className="text-[10px] text-blue-400 font-mono">@{req.username}</span>
                          </div>
                          <span className="text-[9px] text-neutral-500">
                            {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        req.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {req.status === 'PENDING' ? '⏳ PENDING REVIEW' : req.status === 'APPROVED' ? '✅ CONFIRMED & SENT' : '❌ REJECTED'}
                      </span>
                    </div>

                    {/* Amount & Wallet Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#101012] p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-medium">Requested Amount:</span>
                        <div className="flex items-center gap-1.5 text-sm font-black text-amber-400 mt-0.5">
                          <span>{req.amount} GRAM / TON</span>
                          <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4 h-4 rounded-full object-cover shrink-0" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                          <span>Recipient Wallet Address:</span>
                          <button
                            onClick={() => handleCopy(req.walletAddress)}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedAddress === req.walletAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedAddress === req.walletAddress ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-200 mt-0.5 truncate bg-[#18181C] p-1.5 rounded border border-white/5">
                          {req.walletAddress}
                        </p>
                      </div>
                    </div>

                    {/* Transaction Hash / Notes if present */}
                    {req.txHash && (
                      <div className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
                        Transaction Ref: {req.txHash}
                      </div>
                    )}

                    {/* Manual Admin Review Actions */}
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmWithdrawal(req.id, req.walletAddress, req.amount)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تأكيد وإرسال يدوياً (Confirm & Send)</span>
                        </button>

                        <button
                          onClick={() => handleRejectWithdrawal(req.id, req.amount)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          <span>رفض (Reject)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TELEGRAM USERS LIST */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="bg-[#161619] p-3 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Registered Mini App Users</h3>
                <p className="text-[10px] text-neutral-400">Track real Telegram users accessing GiftsVault</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                {users.length} Active Users
              </span>
            </div>

            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-[#161619] border border-white/10 rounded-2xl p-3 flex items-center justify-between hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-[#161619] flex items-center justify-center text-sm font-bold">
                        👤
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{u.first_name}</span>
                        {u.username === 'sekanedr_is' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-blue-400 font-mono">@{u.username}</p>
                      <span className="text-[9px] text-neutral-500">
                        Last seen: {new Date(u.last_seen).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-white">
                      <span>{u.userGram}</span>
                      <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    </div>
                    <span className="text-[10px] text-neutral-400 block">{u.userStars} Stars • {u.giftsCount} Gifts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FREE ADMIN TESTING LAB */}
        {activeTab === 'lab' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-2xl border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Admin Free Testing Privileges</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                As admin <strong className="text-blue-400">@sekanedr_is</strong>, you can enable <strong>Free Testing Mode</strong> to purchase any gift in the store for <strong>0 GRAM</strong> to test rarity rolls, background traits, and inventory management.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Toggle Free Gift Purchases:</span>
                <button
                  onClick={handleToggleFreeMode}
                  className={`px-4 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isAdminFreeMode
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                >
                  {isAdminFreeMode ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>{isAdminFreeMode ? 'Free Testing ENABLED' : 'Enable Free Mode'}</span>
                </button>
              </div>
            </div>

            {/* Quick Admin Test Balance Boost */}
            <div className="bg-[#161619] p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-400" /> Admin Test Balance Controls
              </h4>
              <p className="text-[11px] text-neutral-400">Instantly credit test GRAM balance to your admin account:</p>

              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      const newBal = userGram + amt;
                      onUpdateGram(newBal);
                      showToast(`+${amt} GRAM added to your admin balance!`);
                    }}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 py-2 rounded-xl text-xs font-bold text-blue-300 transition-all active:scale-95 cursor-pointer"
                  >
                    +{amt} GRAM
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Admin Store Supply & MRKT Unlock Simulation */}
            <div className="bg-[#161619] p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <GiftIcon className="w-4 h-4 text-purple-400" /> Store Supply & MRKT Unlock Simulation
              </h4>
              <p className="text-[11px] text-neutral-400">Instantly set store supply to 0 to unlock a gift in MRKT for trading:</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const saved = localStorage.getItem('tg_gifts');
                    if (saved) {
                      const gifts = JSON.parse(saved);
                      const updated = gifts.map((g: any) => g.id === 'gift-1' ? { ...g, remainingSupply: 0, status: 'SOLD_OUT' } : g);
                      localStorage.setItem('tg_gifts', JSON.stringify(updated));
                      showToast('🎉 Tele GT supply set to 0! Unlocked in MRKT!');
                    }
                  }}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 p-2.5 rounded-xl text-xs font-bold text-purple-300 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <div>Sell Out Tele GT</div>
                  <div className="text-[9px] text-purple-400 font-normal mt-0.5">Unlock in MRKT</div>
                </button>

                <button
                  onClick={() => {
                    const saved = localStorage.getItem('tg_gifts');
                    if (saved) {
                      const gifts = JSON.parse(saved);
                      const updated = gifts.map((g: any) => g.id === 'gift-2' ? { ...g, remainingSupply: 0, status: 'SOLD_OUT' } : g);
                      localStorage.setItem('tg_gifts', JSON.stringify(updated));
                      showToast('🎉 Cash Cannon supply set to 0! Unlocked in MRKT!');
                    }
                  }}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 p-2.5 rounded-xl text-xs font-bold text-purple-300 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <div>Sell Out Cash Cannon</div>
                  <div className="text-[9px] text-purple-400 font-normal mt-0.5">Unlock in MRKT</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
