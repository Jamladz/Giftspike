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
import { Gift } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('gifts');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successBackground, setSuccessBackground] = useState<string | null>(null);

  // Use test user ID if not in Telegram environment
  const userId = WebApp.initDataUnsafe?.user?.id?.toString() || 'test-user-123';

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();
    if (WebApp.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    fetchGifts();
    fetchMyGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gifts');
      const data = await res.json();
      setGifts(data);
    } catch (error) {
      console.error('Failed to fetch gifts', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGifts = async () => {
    try {
      const res = await fetch(`/api/my-gifts?userId=${userId}`);
      const data = await res.json();
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

  const handleGiftClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsSheetOpen(true);
  };

  const handlePurchaseSuccess = (orderId: string, background?: string) => {
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
      <div className="min-h-screen bg-[#080809] text-[#F5F5F7] font-sans selection:bg-[#0088CC]/30 overflow-x-hidden">
        {/* Compact & Professional Fixed Header */}
        <header className="fixed top-0 left-0 right-0 w-full z-40 bg-[#121214]/90 backdrop-blur-xl border-b border-[#2C2C2E]/60 pt-safe transition-all">
          <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0088CC] to-[#00AEEF] flex items-center justify-center shadow-md shadow-blue-500/15 shrink-0">
                <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-5 h-5 object-cover rounded-full" />
              </div>
              <h1 className="text-sm font-black text-[#F5F5F7] tracking-tight">GRAM Gifts</h1>
            </div>

            {/* Compact Balance Badge */}
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3A3A3C] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm transition-colors">
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
              <DynamicNumber value="1,240.50" imageClassName="h-3" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 pt-20 pb-28">
          {loading && activeTab === 'gifts' ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'gifts' && (
                <div className="grid grid-cols-2 gap-4">
                  {gifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} onClick={handleGiftClick} />
                  ))}
                </div>
              )}

              {activeTab === 'tasks' && <TasksView />}

              {activeTab === 'mrkt' && <MarketView onSelectGift={handleGiftClick} />}

              {activeTab === 'profile' && (
                <ProfileView 
                  myGifts={myGifts} 
                  userId={userId} 
                  onExploreGifts={() => setActiveTab('gifts')} 
                />
              )}
            </>
          )}
        </main>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />

        {/* Bottom Sheet for Details & Success */}
        <BottomSheet isOpen={isSheetOpen} onClose={closeSheet}>
          {selectedGift && !successOrderId && (
            <GiftDetails 
              gift={selectedGift} 
              onSuccess={handlePurchaseSuccess}
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
      </div>
    </TonConnectUIProvider>
  );
}
