import React from 'react';
import { DynamicNumber } from './DynamicNumber';
import { User, Wallet, Sparkles, Gift as GiftIcon, ExternalLink, ArrowRight, ShieldCheck, Coins, Star, Key, Lock } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { cn } from '../lib/utils';

interface ProfileViewProps {
  myGifts: any[];
  userId: string;
  userStars?: number;
  userGram?: number;
  onExploreGifts: () => void;
  onSelectGift?: (gift: any) => void;
  onOpenWallet?: () => void;
  onOpenAdmin?: () => void;
}

export function ProfileView({ myGifts, userId, userStars = 150, userGram = 0, onExploreGifts, onSelectGift, onOpenWallet, onOpenAdmin }: ProfileViewProps) {

  const tgUser = WebApp.initDataUnsafe?.user;
  const userName = tgUser?.first_name || 'Telegram User';
  const userHandle = tgUser?.username || '';
  const isAdminUser = userHandle.toLowerCase() === 'sekanedr_is';

  // Calculate total portfolio value
  const totalValueGram = myGifts.reduce((acc, item) => acc + (item.priceGram || 0), 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Compact Profile Header Card */}
      <div className="bg-[#18181B] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* User Info Header (Compact Inline Row) */}
        <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-[#18181B] flex items-center justify-center text-xl sm:text-2xl">
                  👤
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border-2 border-[#18181B]">
                <ShieldCheck className="w-3 h-3 text-[#18181B]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">{userName}</h2>
                {isAdminUser && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-0.5 truncate">
                {userHandle ? `@${userHandle}` : `ID: ${userId}`}
              </p>
            </div>
          </div>

          {/* Admin Key Access Button - strictly visible for @sekanedr_is */}
          {isAdminUser && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              title="لوحة تحكم الأدمن @sekanedr_is"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
              <span>Key</span>
            </button>
          )}
        </div>

        {/* Stats Table / Rectangular Compact Horizontal Rows */}
        <div className="space-y-2 w-full">
          {/* GRAM Balance Row */}
          <div className="flex items-center justify-between bg-[#121215] hover:bg-[#16161A] px-3.5 py-2.5 rounded-xl border border-white/5 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="https://i.suar.me/zXrj0/l" alt="GRAM Balance" className="w-4 h-4 rounded-full object-cover shrink-0" />
              </div>
              <span className="text-xs font-semibold text-neutral-300">GRAM Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white">
                <DynamicNumber value={userGram} imageClassName="h-3.5" />
                <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
              </div>
              <button
                onClick={onOpenWallet}
                className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs shadow-md transition-all cursor-pointer"
                title="إيداع وسحب"
              >
                +
              </button>
            </div>
          </div>

          {/* Gifts Row */}
          <div className="flex items-center justify-between bg-[#121215] hover:bg-[#16161A] px-3.5 py-2.5 rounded-xl border border-white/5 transition-all">
            <div className="flex items-center gap-2">
              <img src="https://i.suar.me/PpMvp/l" alt="Gifts" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">Gifts</span>
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">
              <DynamicNumber value={myGifts.length} imageClassName="h-3.5" />
            </div>
          </div>

          {/* Gifts Value Row */}
          <div className="flex items-center justify-between bg-[#121215] hover:bg-[#16161A] px-3.5 py-2.5 rounded-xl border border-white/5 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="https://i.suar.me/zXrj0/l" alt="Gifts Value" className="w-4 h-4 rounded-full object-cover shrink-0" />
              </div>
              <span className="text-xs font-semibold text-neutral-300">Gifts Value</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-blue-400">
              <DynamicNumber value={totalValueGram} imageClassName="h-3.5" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            </div>
          </div>

          {/* App Stars Row */}
          <div className="flex items-center justify-between bg-[#121215] hover:bg-[#16161A] px-3.5 py-2.5 rounded-xl border border-white/5 transition-all">
            <div className="flex items-center gap-2">
              <img src="https://i.suar.me/pM1Qy/l" alt="App Stars" className="w-6 h-6 object-contain shrink-0" />
              <span className="text-xs font-semibold text-neutral-300">App Stars</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-400">
              <DynamicNumber value={userStars} imageClassName="h-3.5" />
              <img src="https://i.suar.me/pM1Qy/l" alt="Stars" className="w-3.5 h-3.5 object-contain shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-5" />

      {/* My Gifts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <GiftIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-[#F5F5F7]">My Gifts Collection</h3>
          </div>
          <div className="flex items-center gap-1 bg-[#18181B] px-2.5 py-0.5 rounded-full border border-white/10">
            <DynamicNumber value={myGifts.length} imageClassName="h-2.5" />
            <span className="text-[10px] text-neutral-400 font-medium">Items</span>
          </div>
        </div>

        {myGifts.length === 0 ? (
          <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
            {/* Frameless Image */}
            <img 
              src="https://i.suar.me/6z9Ka/l" 
              alt="No Gifts" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-3 drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
            <p className="text-base font-bold text-white tracking-tight">No Gifts in Collection</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px] mb-5">
              Explore the store to buy your first Telegram gift on TON network.
            </p>
            <button
              onClick={onExploreGifts}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Gifts Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {myGifts.map((gift) => (
              <div
                key={gift.orderId}
                onClick={() => onSelectGift && onSelectGift(gift)}
                className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] hover:border-[#0088CC]/50 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-square bg-[#161618] rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-[#2C2C2E]">
                    {gift.background && (
                      <img 
                        src={gift.background} 
                        alt="background" 
                        className="absolute inset-0 w-full h-full object-cover object-center" 
                      />
                    )}
                    <img 
                      src={gift.modelUrl || gift.image} 
                      alt={gift.name} 
                      className={cn(
                        "relative z-10 w-20 h-20 object-contain drop-shadow-xl group-hover:scale-105 transition-transform",
                        (gift.name === 'Champion Bear' || gift.id === 'gift-3') && "scale-[1.45]"
                      )} 
                    />
                    <span className="absolute top-1.5 right-1.5 z-20 text-[9px] font-black bg-black/60 backdrop-blur-md text-amber-400 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                      #{gift.serialNumber || '258'}
                    </span>
                    {gift.orderStatus === 'LISTED_ON_MRKT' && (
                      <span className="absolute top-1.5 left-1.5 z-20 text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-sm border border-blue-400/50 shadow-lg">
                        FOR SALE
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs font-bold text-[#F5F5F7] truncate">{gift.name} #{gift.serialNumber || '258'}</p>
                  
                  {/* Trait badges */}
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-[9px] text-[#8E8E93] bg-[#252528] px-1.5 py-0.5 rounded border border-[#3A3A3C] truncate max-w-[100px]">
                      {gift.modelName || 'Classic Blue'}
                    </span>
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 font-mono shrink-0">
                      {gift.backgroundName || 'Black'} ({gift.backgroundRarity || '5%'})
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2C2C2E] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DynamicNumber value={gift.priceGram} imageClassName="h-3" />
                    <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0088CC] bg-[#0088CC]/10 group-hover:bg-[#0088CC]/20 px-2 py-0.5 rounded-lg border border-[#0088CC]/20 transition-colors">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
