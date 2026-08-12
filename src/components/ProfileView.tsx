import React from 'react';
import { DynamicNumber } from './DynamicNumber';
import { User, Wallet, Sparkles, Gift as GiftIcon, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

interface ProfileViewProps {
  myGifts: any[];
  userId: string;
  onExploreGifts: () => void;
}

export function ProfileView({ myGifts, userId, onExploreGifts }: ProfileViewProps) {
  const userName = WebApp.initDataUnsafe?.user?.first_name || 'Telegram User';
  const userHandle = WebApp.initDataUnsafe?.user?.username;

  // Calculate total portfolio value
  const totalValueGram = myGifts.reduce((acc, item) => acc + (item.priceGram || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-b from-[#1C1C1E] to-[#141417] rounded-3xl p-6 border border-[#2C2C2E] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0088CC]/10 rounded-full blur-3xl pointer-events-none" />

        {/* User Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0088CC] to-[#00AEEF] p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-[#1C1C1E] flex items-center justify-center text-3xl">
              👤
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-[#1C1C1E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1C1C1E]" />
          </div>
        </div>

        {/* User Info */}
        <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">{userName}</h2>
        <p className="text-xs text-[#8E8E93] font-mono mt-0.5">
          {userHandle ? `@${userHandle}` : `ID: ${userId}`}
        </p>

        {/* Stats Row */}
        <div className="w-full grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#2C2C2E]">
          <div className="bg-[#161618] p-3 rounded-2xl border border-[#2C2C2E]/80 flex flex-col items-center">
            <p className="text-[9px] uppercase font-bold text-[#8E8E93] mb-1">Owned Gifts</p>
            <DynamicNumber value={myGifts.length} imageClassName="h-4" />
          </div>
          <div className="bg-[#161618] p-3 rounded-2xl border border-[#2C2C2E]/80">
            <p className="text-[9px] uppercase font-bold text-[#8E8E93]">Portfolio Value</p>
            <div className="flex items-center justify-center gap-1 mt-0.5 font-bold text-sm text-amber-400">
              <DynamicNumber value={totalValueGram} imageClassName="h-3.5" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* My Gifts Section (قسم هداياي) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <GiftIcon className="w-4 h-4 text-[#0088CC]" />
            <h3 className="text-sm font-bold text-[#F5F5F7]">My Gifts Collection</h3>
          </div>
          <div className="flex items-center gap-1 bg-[#1C1C1E] px-2.5 py-0.5 rounded-full border border-[#2C2C2E]">
            <DynamicNumber value={myGifts.length} imageClassName="h-2.5" />
            <span className="text-[10px] text-[#8E8E93] font-medium">Items</span>
          </div>
        </div>

        {myGifts.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#1C1C1E] rounded-3xl border border-[#2C2C2E] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#2C2C2E] flex items-center justify-center text-2xl mb-3 opacity-60">
              🎁
            </div>
            <p className="text-sm font-bold text-[#F5F5F7]">No Gifts in Collection</p>
            <p className="text-xs text-[#8E8E93] mt-1 max-w-[220px] mb-4">
              Explore the store to buy your first Telegram gift on TON network.
            </p>
            <button
              onClick={onExploreGifts}
              className="bg-[#0088CC] hover:bg-[#0099EE] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Explore Gifts Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {myGifts.map((gift) => (
              <div
                key={gift.orderId}
                className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-[#161618] rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-[#2C2C2E]">
                    {gift.background && (
                      <img 
                        src={gift.background} 
                        alt="background" 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-90" 
                      />
                    )}
                    <img 
                      src={gift.image} 
                      alt={gift.name} 
                      className="relative z-10 w-20 h-20 object-contain drop-shadow-xl" 
                    />
                    <span className="absolute top-1.5 right-1.5 z-20 text-[9px] font-black bg-green-500/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-sm">
                      OWNED
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#F5F5F7] truncate">{gift.name}</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">
                    {new Date(gift.purchaseDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2C2C2E] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DynamicNumber value={gift.priceGram} imageClassName="h-3" />
                    <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                  </div>
                  <button className="text-[10px] font-bold text-[#0088CC] bg-[#0088CC]/10 hover:bg-[#0088CC]/20 px-2.5 py-1 rounded-lg border border-[#0088CC]/20 transition-colors">
                    List MRKT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
