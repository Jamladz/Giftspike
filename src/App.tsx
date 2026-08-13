import React, { useEffect, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import { GiftCard } from './components/GiftCard';
import { BottomSheet } from './components/BottomSheet';
import { GiftDetails } from './components/GiftDetails';
import { PurchaseSuccess } from './components/PurchaseSuccess';
import { BottomNav } from './components/BottomNav';
import { DynamicNumber } from './components/DynamicNumber';
import { TasksView } from './components/TasksView';
import { MarketView } from './components/MarketView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { Gift } from './types';
import { Loader2 } from 'lucide-react';
import { ReferralBanner } from './components/ReferralBanner';
import { ReferralHub } from './components/ReferralHub';
import { WalletModal } from './components/WalletModal';
import { referralService } from './lib/referral';
import { adminService } from './lib/admin';
import { api } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('gifts');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userStars, setUserStars] = useState<number>(() => {
    const saved = localStorage.getItem('user_stars');
    return saved ? parseInt(saved, 10) : 150;
  });

  const [userGram, setUserGram] = useState<number>(() => {
    const saved = localStorage.getItem('user_gram_balance');
    return saved ? parseFloat(saved) : 0;
  });

  const handleUpdateGram = (newBalance: number) => {
    setUserGram(newBalance);
    localStorage.setItem('user_gram_balance', newBalance.toString());
  };

  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successBackground, setSuccessBackground] = useState<string | null>(null);

  const handleEarnStars = (amount: number) => {
    setUserStars((prev) => {
      const next = prev + amount;
      localStorage.setItem('user_stars', next.toString());
      return next;
    });
  };

  // Use test user ID if not in Telegram environment
  const tgUser = WebApp.initDataUnsafe?.user;
  const userId = tgUser?.id?.toString() || 'test_user_id';
  const userHandle = tgUser?.username || '';
  const userName = tgUser?.first_name || 'Telegram User';

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();
    if (WebApp.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Register active user in admin database
    adminService.registerOrUpdateUser({
      id: userId,
      username: userHandle,
      first_name: userName,
      userGram: userGram,
      userStars: userStars,
      giftsCount: myGifts.length,
    });
    
    // Process referral on launch
    const refResult = referralService.processReferralOnLaunch(userId, userName);
    if (refResult.success && refResult.welcomeBonus > 0) {
      handleEarnStars(refResult.welcomeBonus);
    }

    fetchGifts();
    fetchMyGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const data = await api.getGifts();
      setGifts(data);
    } catch (error) {
      console.error('Failed to fetch gifts', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGifts = async () => {
    try {
      const data = await api.getMyGifts(userId);
      setMyGifts(data);
    } catch (error) {
      console.error('Failed to fetch my gifts', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchMyGifts();
    } else if (activeTab === 'gifts') {
      fetchGifts();
    }
  }, [activeTab]);

  const [purchasedMarketGiftIds, setPurchasedMarketGiftIds] = useState<string[]>([]);

  const handleGiftClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsSheetOpen(true);
  };

  const handlePurchaseSuccess = (orderId: string, background?: string) => {
    if (selectedGift && selectedGift.isMrktListing) {
      setPurchasedMarketGiftIds(prev => [...prev, selectedGift.id]);
    }
    setSuccessOrderId(orderId);
    setSuccessBackground(background || null);
    fetchGifts(); // Refresh supply
    fetchMyGifts(); // Refresh my gifts
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setSelectedGift(null);
      setSuccessOrderId(null);
      setSuccessBackground(null);
    }, 300); // Wait for animation
  };

  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div className="min-h-screen bg-[#040405] text-[#F5F5F7] font-sans selection:bg-[#0088CC]/30 flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-[#080809] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-x-hidden sm:border-x border-[#2C2C2E]/40 flex flex-col">
          {/* Compact & Professional Fixed Header */}
          <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[#121214]/90 backdrop-blur-xl border-b border-[#2C2C2E]/60 pt-safe transition-all max-w-[480px] mx-auto">
            <div className="flex items-center justify-between px-3 h-14 w-full">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                <img src="https://i.suar.me/9zJ7w/l" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-base font-bold text-[#F5F5F7] tracking-tight">GiftsVault</h1>
            </div>

            {/* Balances Badges */}
            <div className="flex items-center gap-2">
              {/* Stars Balance Badge */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm transition-colors">
                <img src="https://i.suar.me/pM1Qy/l" alt="Stars" className="w-3.5 h-3.5 object-contain shrink-0" />
                <DynamicNumber value={userStars} imageClassName="h-3 text-amber-400 font-bold" />
              </div>

              {/* GRAM Balance Badge with + Button */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3A3A3C] rounded-full pl-2.5 pr-1 py-0.5 flex items-center gap-1.5 shadow-sm transition-colors">
                <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                <DynamicNumber value={userGram} imageClassName="h-3 font-bold" />
                <button 
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all cursor-pointer ml-0.5"
                  title="إيداع وسحب GRAM & TON"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 pt-16 pb-28 w-full flex-1">
          {loading && activeTab === 'gifts' ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'gifts' && (
                <div className="space-y-3 sm:space-y-4">
                  <ReferralBanner userId={userId} onOpenReferralHub={() => setActiveTab('referral')} />
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {gifts.map((gift) => (
                      <GiftCard key={gift.id} gift={gift} onClick={handleGiftClick} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <TasksView 
                  userStars={userStars} 
                  onEarnStars={handleEarnStars} 
                  onOpenWallet={() => setIsWalletModalOpen(true)} 
                />
              )}

              {activeTab === 'referral' && (
                <ReferralHub 
                  userId={userId} 
                  userStars={userStars} 
                  onEarnStars={handleEarnStars} 
                />
              )}

              {activeTab === 'mrkt' && (
                <MarketView 
                  onSelectGift={handleGiftClick} 
                  purchasedGiftIds={purchasedMarketGiftIds} 
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView 
                  myGifts={myGifts} 
                  userId={userId} 
                  userStars={userStars}
                  userGram={userGram}
                  onExploreGifts={() => setActiveTab('gifts')} 
                  onSelectGift={handleGiftClick}
                  onOpenWallet={() => setIsWalletModalOpen(true)}
                  onOpenAdmin={() => setIsAdminDashboardOpen(true)}
                />
              )}
            </>
          )}
        </main>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Admin Dashboard View */}
        {isAdminDashboardOpen && (
          <AdminDashboard
            onClose={() => setIsAdminDashboardOpen(false)}
            userGram={userGram}
            onUpdateGram={handleUpdateGram}
          />
        )}

        {/* Bottom Sheet for Details & Success */}
        <BottomSheet isOpen={isSheetOpen} onClose={closeSheet}>
          {selectedGift && !successOrderId && (
            <GiftDetails 
              gift={selectedGift} 
              onSuccess={handlePurchaseSuccess}
              onListed={() => {
                fetchMyGifts();
                closeSheet();
              }}
              userId={userId} 
            />
          )}
          {selectedGift && successOrderId && (
            <PurchaseSuccess 
              gift={selectedGift} 
              orderId={successOrderId} 
              background={successBackground}
              onClose={closeSheet} 
            />
          )}
        </BottomSheet>

        {/* Deposit & Withdraw Wallet Modal (75% height sheet with TON Connect) */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          userGram={userGram}
          onUpdateGram={handleUpdateGram}
        />
        </div>
      </div>
    </TonConnectUIProvider>
  );
}
