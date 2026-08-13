import React from 'react';
import { Gift } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface PurchaseSuccessProps {
  gift: Gift;
  orderId: string;
  background?: string | null;
  onClose: () => void;
}

export function PurchaseSuccess({ gift, orderId, background, onClose }: PurchaseSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-[60vh] relative text-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60 hover:text-white transition-colors z-50"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full" />
        <div className="relative w-40 h-40 rounded-[2rem] bg-[#2C2C2E] border-2 border-[#3A3A3C] flex items-center justify-center overflow-hidden mx-auto shadow-2xl">
          {background && (
            <img 
              src={background} 
              alt="background" 
              className="absolute inset-0 w-full h-full object-cover opacity-90" 
            />
          )}
          <img 
            src={gift.image} 
            alt={gift.name} 
            className={cn(
              "relative z-10 w-28 h-28 object-contain drop-shadow-xl",
              (gift.name === 'Champion Bear' || gift.id === 'gift-3') && "scale-125"
            )} 
          />
        </div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-3 -right-3 bg-green-500 rounded-full p-1.5 border-4 border-[#1C1C1E] z-20 shadow-lg"
        >
          <CheckCircle2 className="w-7 h-7 text-[#1C1C1E]" />
        </motion.div>
      </motion.div>

      <h2 className="text-2xl font-bold text-[#F5F5F7] mb-2">Gift Purchased!</h2>
      <p className="text-[#8E8E93] mb-8">You successfully purchased <span className="text-[#F5F5F7] font-medium">{gift.name}</span>.</p>

      <div className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-4 mb-8 text-left space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[#8E8E93] text-sm">Price</span>
          <div className="flex items-center gap-1.5">
            <DynamicNumber value={gift.priceGram} imageClassName="h-3.5" />
            <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#8E8E93] text-sm">Transaction ID</span>
          <span className="text-[#F5F5F7] font-medium text-sm font-mono bg-[#141417] px-2 py-1 rounded">
            {orderId.substring(0, 8)}...{orderId.substring(orderId.length - 8)}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full h-14 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-[#F5F5F7] rounded-2xl font-bold text-lg transition-colors"
      >
        Close
      </button>
    </div>
  );
}
