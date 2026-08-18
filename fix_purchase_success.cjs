const fs = require('fs');

const code = `import React from 'react';
import { Gift } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { CheckCircle2, X, Sparkles, Diamond, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface PurchaseSuccessProps {
  gift: Gift;
  orderId: string;
  orderData?: any;
  onClose: () => void;
}

export function PurchaseSuccess({ gift, orderId, orderData, onClose }: PurchaseSuccessProps) {
  const finalImage = orderData?.modelUrl || gift.image;
  const finalBg = orderData?.background || null;
  const modelName = orderData?.modelName || gift.name;
  const bgName = orderData?.backgroundName || 'Default';
  const modelRarity = orderData?.modelRarity || 'Common';
  const bgRarity = orderData?.backgroundRarity || 'Common';

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-[75vh] relative text-center">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/60 hover:text-white transition-colors z-50"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative mb-8 mt-4"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full" />
        <div className="relative w-48 h-48 rounded-[2.5rem] bg-[#1C1C1E] border border-white/10 flex items-center justify-center overflow-hidden mx-auto shadow-2xl">
          {finalBg && (
            <img 
              src={finalBg} 
              alt="background" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 scale-110" 
            />
          )}
          <img 
            src={finalImage} 
            alt={modelName} 
            className={cn(
              "relative z-10 w-36 h-36 object-contain drop-shadow-2xl",
              (modelName.includes('Bear') || gift.id === 'gift-3') && "scale-[1.5]"
            )} 
          />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
          className="absolute -bottom-3 -right-3 bg-blue-500 rounded-full p-2 border-4 border-[#080809] z-20 shadow-lg shadow-blue-500/30"
        >
          <CheckCircle2 className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      <div className="space-y-1 mb-6">
         <h2 className="text-2xl font-black text-white tracking-tight">Gift Unlocked!</h2>
         <p className="text-neutral-400 text-sm">Your new gift was safely added to your collection.</p>
      </div>

      <div className="w-full bg-[#121214] border border-white/5 rounded-2xl p-4 mb-6 text-left space-y-3">
        <div className="flex justify-between items-center bg-[#18181A] p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-300 text-xs font-bold uppercase tracking-wider">Model Variant</span>
          </div>
          <div className="text-right">
             <span className="text-white font-black text-sm block">{modelName}</span>
             <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">Rarity: {modelRarity}</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-[#18181A] p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Diamond className="w-4 h-4 text-purple-400" />
            <span className="text-neutral-300 text-xs font-bold uppercase tracking-wider">Backdrop</span>
          </div>
          <div className="text-right">
             <span className="text-white font-black text-sm block">{bgName}</span>
             <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-1.5 py-0.5 rounded">Rarity: {bgRarity}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#121214] border border-white/5 rounded-2xl p-4 mb-8 text-left space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Price Paid</span>
          {gift.priceGram ? (
            <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
              <span className="text-blue-400 font-black">{gift.priceGram}</span>
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-4 h-4 rounded-full object-cover shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <span className="text-amber-400 font-black">{gift.priceStars}</span>
              <span className="text-sm">⭐️</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Order ID
          </span>
          <span className="text-neutral-300 font-medium text-[11px] font-mono bg-[#18181A] px-2 py-1 rounded border border-white/5">
            {orderId.substring(0, 8)}...{orderId.substring(orderId.length - 8)}
          </span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 text-white rounded-2xl font-black text-sm transition-all active:scale-95"
      >
        View in Collection
      </button>
    </div>
  );
}
`;

fs.writeFileSync('src/components/PurchaseSuccess.tsx', code);
