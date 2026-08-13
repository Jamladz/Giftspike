import React, { useState, useEffect } from 'react';
import { Gift, PaymentState } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Hash, Layers, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { adminService } from '../lib/admin';

const BACKGROUNDS = [
  'https://i.suar.me/2zOW9/l', // Burgundy
  'https://i.suar.me/Lpozo/l', // Black
  'https://i.suar.me/8zo1y/l', // Green
  'https://i.suar.me/jv05v/l', // Brown
  'https://i.suar.me/g46m5/l', // Orange
  'https://i.suar.me/9zJo7/l', // Purple
  'https://i.suar.me/V9BKK/l', // Gold
  'https://i.suar.me/YQBX9/l', // Cyan
  'https://i.suar.me/MpVKv/l', // Red
];

const BACKGROUND_NAMES = [
  'Burgundy', 'Black', 'Green', 'Brown', 'Orange', 'Purple', 'Gold', 'Cyan', 'Red'
];

const BACKGROUND_RARITIES = [
  '15%', '5%', '15%', '25%', '25%', '15%', '2%', '15%', '8%'
];

interface GiftDetailsProps {
  gift: Gift & {
    orderId?: string;
    background?: string;
    backgroundName?: string;
    backgroundRarity?: string;
    modelUrl?: string;
    modelName?: string;
    modelRarity?: string;
    serialNumber?: number;
    isMrktListing?: boolean;
    seller?: string;
  };
  onSuccess: (orderId: string, background?: string) => void;
  userId?: string;
}

export function GiftDetails({ gift, onSuccess, userId }: GiftDetailsProps) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [paymentState, setPaymentState] = useState<PaymentState>('INITIAL');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  const isOwned = !!gift.orderId;
  const isFixed = isOwned || !!gift.isMrktListing || !!gift.background || !!gift.modelUrl;

  const isCannon = gift.name === 'Cash Cannon' || gift.id === 'gift-2';
  const models = isCannon ? [
    'https://i.suar.me/6z9Ka/l',
    'https://i.suar.me/vAdEW/l',
    'https://i.suar.me/EpjKx/l',
    'https://i.suar.me/PpMOQ/l',
    'https://i.suar.me/WPBxr/l'
  ] : [
    gift.image,
    'https://i.suar.me/Gn3GN/l',
    'https://i.suar.me/ApeYO/l',
    'https://i.suar.me/0poq0/l',
    'https://i.suar.me/ZzXKJ/l'
  ];

  const modelNames = isCannon 
    ? ['Matte Black', 'Ruby Red', 'Electric Cyan', 'Gold Deluxe', 'Diamond Cannon']
    : ['Classic Blue', 'Neon Pink', 'Emerald Green', 'Sunset Orange', 'Cyber Silver'];

  const modelRarities = isCannon
    ? ['45%', '25%', '15%', '10%', '5%']
    : ['40%', '25%', '20%', '10%', '5%'];

  useEffect(() => {
    if (isFixed) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isFixed]);

  useEffect(() => {
    if (isFixed) return;
    const interval = setInterval(() => {
      setCurrentModelIndex((prev) => (prev + 1) % models.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [models.length, isFixed]);

  const percentageRemaining = (gift.remainingSupply / gift.totalSupply) * 100;
  
  let supplyStatus = 'Available';
  if (percentageRemaining === 0) {
    supplyStatus = 'Sold Out';
  } else if (percentageRemaining <= 10) {
    supplyStatus = 'Almost Sold Out';
  } else if (percentageRemaining <= 50) {
    supplyStatus = 'Limited';
  }

  const isSoldDeal = !!(gift as any).buyer || !!(gift as any).soldAt;
  const isSoldOut = gift.isMrktListing 
    ? isSoldDeal 
    : (gift.status === 'SOLD_OUT' || gift.remainingSupply <= 0);

  const handleBuy = async () => {
    if (isOwned || isSoldOut) return;
    
    try {
      const isAdminFreeMode = adminService.getAdminFreeMode();

      // Free Admin Purchase path
      if (isAdminFreeMode) {
        setPaymentState('PROCESSING');
        const randomBackground = gift.background || BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        const orderData = await api.createOrder(userId || 'anonymous', gift.id, randomBackground);
        
        // Auto verify for free admin testing
        await api.verifyOrder(orderData.orderId, 'admin_free_test_boc');
        setPaymentState('SUCCESS');
        setTimeout(() => {
          onSuccess(orderData.orderId, randomBackground);
        }, 1200);
        return;
      }

      if (!wallet) {
        setPaymentState('CONNECTING');
        await tonConnectUI.openModal();
        setPaymentState('INITIAL');
        return;
      }

      setPaymentState('PROCESSING');

      const randomBackground = gift.background || BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

      // 1. Create order intent on backend
      const orderData = await api.createOrder(userId || 'anonymous', gift.id, randomBackground);

      setPaymentState('CONFIRMING');

      // 2. Prepare transaction
      const amountNano = (orderData.amountGram * 1000000000).toString();
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: orderData.receiverAddress,
            amount: amountNano,
            payload: btoa(`Order: ${orderData.orderId}`)
          }
        ]
      };

      // 3. Send transaction via wallet
      const result = await tonConnectUI.sendTransaction(transaction);

      setPaymentState('VERIFYING');

      // 4. Verify transaction on backend
      await api.verifyOrder(orderData.orderId, result.boc);

      setPaymentState('SUCCESS');
      setTimeout(() => {
        onSuccess(orderData.orderId, randomBackground);
      }, 1500);

    } catch (error) {
      console.error(error);
      setPaymentState('ERROR');
      setTimeout(() => setPaymentState('INITIAL'), 3000);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Edge-to-Edge Image Header */}
      <div className="relative w-full h-44 sm:h-48 bg-[#1C1C1E] border-b border-[#3A3A3C]/80 overflow-hidden shrink-0 flex items-center justify-center transition-all">
        {/* Background Image */}
        {isFixed ? (
          <img
            src={gift.background || BACKGROUNDS[0]}
            className="absolute inset-0 w-full h-full object-cover object-center"
            alt="fixed background"
          />
        ) : (
          <AnimatePresence>
            <motion.img
              key={currentBgIndex}
              src={BACKGROUNDS[currentBgIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover object-center"
              alt="background"
            />
          </AnimatePresence>
        )}
        
        {/* Gift Model Overlay */}
        {isFixed ? (
          <img 
            src={gift.modelUrl || gift.image} 
            alt={gift.name} 
            className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-2xl transition-all"
          />
        ) : (
          <AnimatePresence>
            <motion.img 
              key={currentModelIndex}
              src={models[currentModelIndex]} 
              alt={gift.name} 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute z-10 w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-2xl" 
            />
          </AnimatePresence>
        )}

        {/* Badge on top right for serial or rarity */}
        {gift.serialNumber && (
          <div className="absolute top-2.5 right-2.5 z-20 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1 shadow-lg">
            <Hash className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-black text-amber-400 font-mono">#{gift.serialNumber}</span>
          </div>
        )}
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="px-4 pt-2.5 pb-16 flex-1 flex flex-col">
        {/* Title & Price Header */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[#F5F5F7] truncate">{gift.name}</h2>
              {gift.serialNumber && (
                <span className="text-xs font-black text-[#0088CC] font-mono">#{gift.serialNumber}</span>
              )}
            </div>
            {isSoldDeal ? (
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-purple-400" /> SOLD DEAL
              </span>
            ) : isOwned ? (
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> OWNED
              </span>
            ) : gift.isMrktListing ? (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                MRKT LISTING
              </span>
            ) : (
              <span className="bg-[#0088CC] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                OFFICIAL
              </span>
            )}
          </div>

          {/* Price & Seller Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DynamicNumber value={gift.priceGram} imageClassName="h-4" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4 h-4 rounded-full object-cover shrink-0 shadow-sm" />
            </div>
            {gift.seller && !isSoldDeal && (
              <span className="text-[11px] text-[#8E8E93]">
                Seller: <strong className="text-[#F5F5F7]">@{gift.seller}</strong>
              </span>
            )}
          </div>
        </div>

        {/* SOLD DEAL SUMMARY (If item is from Sold tab) */}
        {isSoldDeal && (
          <div className="bg-[#18181B] rounded-xl p-2.5 border border-purple-500/30 mb-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Completed Deal Transaction
              </span>
              <span className="text-[9px] text-[#8E8E93] bg-[#222225] px-1.5 py-0.5 rounded border border-[#2C2C2E]">
                {(gift as any).soldAt || 'Sold'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-[#121214] p-2 rounded-lg border border-[#2C2C2E]">
              <div>
                <span className="text-[8px] uppercase font-bold text-[#8E8E93] block">Seller</span>
                <span className="text-xs font-bold text-[#F5F5F7]">@{(gift as any).seller || 'seller'}</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase font-bold text-[#8E8E93] block">Buyer</span>
                <span className="text-xs font-bold text-green-400">@{(gift as any).buyer || 'buyer'}</span>
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONALLY RENDER: FIXED TRAITS / RARITY or SUPPLY & MODEL */}
        {isFixed ? (
          <div className="space-y-2 mb-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Unique Item Traits
              </span>
              <span className="text-[9px] font-mono text-[#0088CC] font-bold">
                Mint #{gift.serialNumber || '258'}
              </span>
            </div>

            {/* Model Trait Frame (Stacked Top) */}
            <div className="bg-[#252528] rounded-xl p-2.5 border border-[#3A3A3C]/70 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2.5 z-10 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#18181A] border border-[#3A3A3C] p-0.5 shrink-0 flex items-center justify-center">
                  <img src={gift.modelUrl || gift.image} alt="model" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] text-[#8E8E93] font-bold uppercase flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-blue-400" /> Model Trait
                  </span>
                  <p className="text-xs font-black text-[#F5F5F7] truncate">{gift.modelName || 'Classic Blue'}</p>
                </div>
              </div>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-bold px-2 py-0.5 rounded font-mono shrink-0 z-10">
                {gift.modelRarity || '15%'}
              </span>
            </div>

            {/* Background Trait Frame (Stacked Underneath) */}
            <div className="bg-[#252528] rounded-xl p-2.5 border border-[#3A3A3C]/70 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2.5 z-10 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#18181A] border border-[#3A3A3C] overflow-hidden shrink-0">
                  <img src={gift.background || BACKGROUNDS[0]} alt="bg" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] text-[#8E8E93] font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Background Trait
                  </span>
                  <p className="text-xs font-black text-[#F5F5F7] truncate">{gift.backgroundName || 'Black'}</p>
                </div>
              </div>
              <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded font-mono border shrink-0 z-10",
                (gift.backgroundName === 'Gold' || gift.backgroundName === 'Black' || gift.backgroundName === 'Red')
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
              )}>
                {gift.backgroundRarity || '5%'}
              </span>
            </div>
          </div>
        ) : (
          /* Total Supply & Model Section for Store Items */
          <div className="space-y-2 mb-2.5">
            {/* Supply Frame */}
            <div className="bg-[#252528] rounded-xl p-2.5 border border-[#3A3A3C]/70">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-[#8E8E93] font-bold mb-0.5">Supply</p>
                  <div className="flex items-center gap-1">
                    <DynamicNumber value={gift.remainingSupply} imageClassName="h-3" />
                    <span className="text-[#8E8E93] text-xs font-medium">/</span>
                    <DynamicNumber value={gift.totalSupply} imageClassName="h-3" />
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-0.5">
                    <DynamicNumber value={`${percentageRemaining.toFixed(1)}%`} imageClassName="h-3" />
                  </div>
                  <p className={cn("text-[8px] font-bold uppercase mt-0.5", 
                    supplyStatus === 'Sold Out' ? 'text-gray-400' : 
                    supplyStatus === 'Almost Sold Out' ? 'text-red-400' : 'text-[#8E8E93]'
                  )}>
                    {supplyStatus}
                  </p>
                </div>
              </div>
              <div className="w-full bg-[#141417] h-1.5 rounded-full p-0.5 border border-[#3A3A3C]/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentageRemaining}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,136,204,0.5)]", 
                    isSoldOut ? "bg-gray-500" : "bg-gradient-to-r from-blue-600 to-[#0088CC]")}
                />
              </div>
            </div>

            {/* Model Frame under Supply */}
            <div className="bg-[#252528] rounded-xl p-2.5 border border-[#3A3A3C]/70 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="min-w-0 flex items-center gap-2.5 z-10">
                <div className="w-7 h-7 rounded-lg bg-[#18181A] border border-[#3A3A3C] p-0.5 shrink-0 flex items-center justify-center">
                  <img src={models[currentModelIndex]} alt="model preview" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] uppercase tracking-widest text-[#8E8E93] font-bold flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-blue-400" /> Model
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentModelIndex}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      className="text-xs font-black text-[#F5F5F7] truncate"
                    >
                      {modelNames[currentModelIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-bold px-2 py-0.5 rounded font-mono shrink-0 z-10">
                {modelRarities[currentModelIndex]} Rarity
              </span>
            </div>

            {/* Background Frame under Model */}
            <div className="bg-[#252528] rounded-xl p-2.5 border border-[#3A3A3C]/70 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="min-w-0 flex items-center gap-2.5 z-10">
                <div className="w-7 h-7 rounded-lg bg-[#18181A] border border-[#3A3A3C] overflow-hidden shrink-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentBgIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      src={BACKGROUNDS[currentBgIndex]}
                      alt="background preview"
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] uppercase tracking-widest text-[#8E8E93] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Background
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentBgIndex}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      className="text-xs font-black text-[#F5F5F7] truncate"
                    >
                      {BACKGROUND_NAMES[currentBgIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentBgIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "text-[8px] font-bold px-2 py-0.5 rounded font-mono border shrink-0 z-10",
                    (BACKGROUND_NAMES[currentBgIndex] === 'Gold' || BACKGROUND_NAMES[currentBgIndex] === 'Black' || BACKGROUND_NAMES[currentBgIndex] === 'Red')
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  )}
                >
                  {BACKGROUND_RARITIES[currentBgIndex]} Rarity
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/95 to-transparent z-20 max-w-md mx-auto">
          {isOwned ? (
            <button
              disabled
              className="w-full h-10 rounded-xl flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>In Your Collection (#{gift.serialNumber || '258'})</span>
            </button>
          ) : (
            <button
              onClick={handleBuy}
              disabled={isSoldOut || paymentState !== 'INITIAL'}
              className={cn(
                "w-full h-10 sm:h-11 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs font-bold",
                isSoldOut ? "bg-[#2A2A2D] text-[#8E8E93] border border-[#3A3A3C] cursor-not-allowed" :
                paymentState === 'ERROR' ? "bg-red-500 text-white" :
                paymentState === 'SUCCESS' ? "bg-green-500 text-white shadow-[0_4px_16px_rgba(34,197,94,0.3)]" :
                "bg-[#0088CC] hover:bg-[#0099EE] text-white shadow-[0_4px_16px_rgba(0,136,204,0.3)]"
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={paymentState}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  {paymentState === 'INITIAL' && !isSoldOut && (
                    <>
                      <span className="font-extrabold tracking-tight">
                        {gift.isMrktListing ? 'Buy on MRKT for' : 'Buy for'}
                      </span>
                      <DynamicNumber value={gift.priceGram} imageClassName="h-3.5" />
                      <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4 h-4 rounded-full object-cover shrink-0" />
                    </>
                  )}
                  {isSoldOut && (
                    <span className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{isSoldDeal ? `Sold Deal (@${(gift as any).buyer || 'buyer'})` : "Sold Out"}</span>
                    </span>
                  )}
                  {paymentState === 'CONNECTING' && <><Loader2 className="animate-spin w-3.5 h-3.5"/> Connecting Wallet...</>}
                  {paymentState === 'CONFIRMING' && <><Loader2 className="animate-spin w-3.5 h-3.5"/> Confirm in wallet</>}
                  {paymentState === 'PROCESSING' && <><Loader2 className="animate-spin w-3.5 h-3.5"/> Processing...</>}
                  {paymentState === 'VERIFYING' && <><Loader2 className="animate-spin w-3.5 h-3.5"/> Verifying...</>}
                  {paymentState === 'SUCCESS' && <><CheckCircle2 className="w-3.5 h-3.5"/> Gift Purchased</>}
                  {paymentState === 'ERROR' && <><AlertCircle className="w-3.5 h-3.5"/> Payment Failed</>}
                </motion.div>
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

