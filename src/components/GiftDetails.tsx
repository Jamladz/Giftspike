import React, { useState, useEffect } from 'react';
import { Gift, PaymentState } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

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

interface GiftDetailsProps {
  gift: Gift;
  onSuccess: (orderId: string, background?: string) => void;
  userId?: string;
}

export function GiftDetails({ gift, onSuccess, userId }: GiftDetailsProps) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [paymentState, setPaymentState] = useState<PaymentState>('INITIAL');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  const models = [
    gift.image,
    'https://i.suar.me/Gn3GN/l',
    'https://i.suar.me/ApeYO/l',
    'https://i.suar.me/0poq0/l',
    'https://i.suar.me/ZzXKJ/l'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentModelIndex((prev) => (prev + 1) % models.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [models.length]);

  const percentageRemaining = (gift.remainingSupply / gift.totalSupply) * 100;
  
  let supplyStatus = 'Available';
  let progressColor = 'bg-blue-500';
  if (percentageRemaining === 0) {
    supplyStatus = 'Sold Out';
    progressColor = 'bg-gray-500';
  } else if (percentageRemaining <= 10) {
    supplyStatus = 'Almost Sold Out';
    progressColor = 'bg-red-500';
  } else if (percentageRemaining <= 50) {
    supplyStatus = 'Limited';
    progressColor = 'bg-orange-500';
  }

  const handleBuy = async () => {
    if (gift.remainingSupply <= 0) return;
    
    try {
      if (!wallet) {
        setPaymentState('CONNECTING');
        await tonConnectUI.openModal();
        setPaymentState('INITIAL');
        return;
      }

      setPaymentState('PROCESSING');

      const randomBackground = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

      // 1. Create order intent on backend
      const orderData = await api.createOrder(userId || 'anonymous', gift.id, randomBackground);

      setPaymentState('CONFIRMING');

      // 2. Prepare transaction
      // Convert GRAM to nanoGRAM (1 GRAM = 10^9 nano)
      const amountNano = (orderData.amountGram * 1000000000).toString();
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: orderData.receiverAddress,
            amount: amountNano,
            // Include order ID in payload for verification (simplified here)
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

  const isSoldOut = gift.status === 'SOLD_OUT' || gift.remainingSupply <= 0;

  return (
    <div className="flex flex-col w-full">
      {/* Full-bleed Edge-to-Edge Image Header */}
      <div className="relative w-full h-52 bg-[#1C1C1E] border-b border-[#3A3A3C]/80 overflow-hidden shrink-0 flex items-center justify-center">
        {/* Animated Backgrounds */}
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
        
        {/* Animated Gift Models Overlay */}
        <AnimatePresence>
          <motion.img 
            key={currentModelIndex}
            src={models[currentModelIndex]} 
            alt={gift.name} 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute z-10 w-40 h-40 object-contain drop-shadow-2xl" 
          />
        </AnimatePresence>
        
        {/* Subtle Gradient Overlay for depth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="px-5 pt-3 pb-24 flex-1 flex flex-col">
        {/* Title & Price Header */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold tracking-tight text-[#F5F5F7] truncate">{gift.name}</h2>
            {gift.status === 'LIMITED' && (
              <div className="bg-[#0088CC] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shrink-0">LEGENDARY</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <DynamicNumber value={gift.priceGram} imageClassName="h-5" />
            <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm" />
          </div>
        </div>

        {/* Supply Section */}
        <div className="bg-[#252528] rounded-2xl p-3 mb-3 border border-[#3A3A3C]/70">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8E8E93] font-bold mb-0.5">Supply</p>
              <div className="flex items-center gap-1">
                <DynamicNumber value={gift.remainingSupply} imageClassName="h-3.5" />
                <span className="text-[#8E8E93] text-xs font-medium">/</span>
                <DynamicNumber value={gift.totalSupply} imageClassName="h-3.5" />
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-0.5">
                <DynamicNumber value={`${percentageRemaining.toFixed(1)}%`} imageClassName="h-3.5" />
              </div>
              <p className={cn("text-[9px] font-bold uppercase mt-0.5", 
                supplyStatus === 'Sold Out' ? 'text-gray-400' : 
                supplyStatus === 'Almost Sold Out' ? 'text-red-400' : 'text-[#8E8E93]'
              )}>
                {supplyStatus}
              </p>
            </div>
          </div>
          <div className="w-full bg-[#141417] h-2 rounded-full p-0.5 border border-[#3A3A3C]/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentageRemaining}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,136,204,0.5)]", 
                isSoldOut ? "bg-gray-500" : "bg-gradient-to-r from-blue-600 to-[#0088CC]")}
            />
          </div>
        </div>

        {/* Fixed Bottom Buy Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/95 to-transparent z-20">
          <button
            onClick={handleBuy}
            disabled={isSoldOut || paymentState !== 'INITIAL'}
            className={cn(
              "w-full h-12 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm font-bold",
              isSoldOut ? "bg-[#3A3A3C] text-[#8E8E93] cursor-not-allowed" :
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
                    <span className="font-extrabold tracking-tight">Buy for</span>
                    <DynamicNumber value={gift.priceGram} imageClassName="h-4" />
                    <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4.5 h-4.5 rounded-full object-cover shrink-0" />
                  </>
                )}
                {isSoldOut && "Sold Out"}
                {paymentState === 'CONNECTING' && <><Loader2 className="animate-spin w-4 h-4"/> Connecting Wallet...</>}
                {paymentState === 'CONFIRMING' && <><Loader2 className="animate-spin w-4 h-4"/> Confirm in wallet</>}
                {paymentState === 'PROCESSING' && <><Loader2 className="animate-spin w-4 h-4"/> Processing...</>}
                {paymentState === 'VERIFYING' && <><Loader2 className="animate-spin w-4 h-4"/> Verifying...</>}
                {paymentState === 'SUCCESS' && <><CheckCircle2 className="w-4 h-4"/> Gift Purchased</>}
                {paymentState === 'ERROR' && <><AlertCircle className="w-4 h-4"/> Payment Failed</>}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}
