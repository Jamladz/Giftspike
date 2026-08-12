import React from 'react';
import { Gift } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface GiftCardProps {
  gift: Gift;
  onClick: (gift: Gift) => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, onClick }) => {
  const isSoldOut = gift.status === 'SOLD_OUT';

  return (
    <motion.button
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(gift)}
      className="bg-[#1C1C1E] rounded-[24px] border border-[#2C2C2E] flex flex-col group cursor-pointer hover:border-[#3A3A3C] transition-all relative w-full overflow-hidden shadow-sm"
    >
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
            Sold Out
          </span>
        </div>
      )}
      
      {/* Frameless Edge-to-Edge Image Area */}
      <div className="relative w-full aspect-square bg-[#121214] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0088CC]/5 via-transparent to-white/5 opacity-80 group-hover:opacity-100 transition-opacity" />
        <img 
          src={gift.image} 
          alt={gift.name} 
          className="w-28 h-28 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] relative z-10"
          loading="lazy"
        />
        {gift.status === 'LIMITED' && (
          <span className="absolute top-2.5 right-2.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded-md border border-yellow-500/20 z-20 backdrop-blur-md tracking-wider">
            RARE
          </span>
        )}
      </div>

      {/* Divided Details Section (قسم بطاقة من فوق الاسم) */}
      <div className="text-center w-full p-3.5 border-t border-[#2C2C2E]/80 bg-[#1C1C1E] flex flex-col justify-between flex-1 relative z-20">
        <h3 className="text-[13px] font-bold mb-1.5 truncate text-[#F5F5F7] tracking-tight">{gift.name}</h3>
        
        <div className="flex justify-center items-center gap-1 mb-2.5">
          <DynamicNumber value={gift.priceGram} imageClassName="h-3.5" />
          <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0 shadow-sm" />
        </div>
        
        <div className="w-full bg-[#080809] h-1.5 rounded-full overflow-hidden shadow-inner border border-white/5">
          <div className="bg-gradient-to-r from-[#0088CC] to-[#00AEEF] h-full rounded-full transition-all duration-500" style={{ width: `${(gift.remainingSupply / gift.totalSupply) * 100}%` }}></div>
        </div>
        <div className="flex items-center justify-center gap-0.5 text-[10px] text-[#8E8E93] mt-2 font-medium">
          <DynamicNumber value={gift.remainingSupply} imageClassName="h-2.5" />
          <span className="text-[#5C5C5E] mx-0.5">/</span>
          <DynamicNumber value={gift.totalSupply} imageClassName="h-2.5" />
          <span className="uppercase text-[8px] tracking-wider text-[#8E8E93] ml-1">Left</span>
        </div>
      </div>
    </motion.button>
  );
}
