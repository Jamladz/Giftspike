import React from 'react';
import { Gift } from '../types';
import { DynamicNumber } from './DynamicNumber';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GiftCardProps {
  gift: Gift;
  onClick: (gift: Gift) => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, onClick }) => {
  const isSoldOut = gift.status === 'SOLD_OUT';
  const isCharacterGift = gift.name === 'Champion Bear' || gift.id === 'gift-3' || gift.name === 'Goal King' || gift.id === 'gift-4';

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(gift)}
      className="bg-[#18181A] rounded-2xl sm:rounded-[22px] border border-white/10 flex flex-col group cursor-pointer hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative w-full overflow-hidden shadow-lg shadow-black/40"
    >
      {isSoldOut && (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-[3px]">
          <span className="bg-red-500/90 text-white text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg shadow-red-500/20">
            Sold Out
          </span>
        </div>
      )}
      
      {/* Frameless Edge-to-Edge Image Area */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#1E1E22] to-[#121214] flex items-center justify-center p-2.5 sm:p-3.5 overflow-hidden">
        {/* Subtle Ambient Radial Glow behind Gift */}
        <div className="absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        <img 
          src={gift.image} 
          alt={gift.name} 
          className={cn(
            "w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] relative z-10 p-1",
            isCharacterGift && "scale-[1.8] p-0"
          )}
          loading="lazy"
        />
        {gift.status === 'LIMITED' && (
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border border-amber-500/40 z-20 backdrop-blur-md tracking-wider shadow-sm">
            RARE
          </span>
        )}
      </div>

      {/* Divided Details Section */}
      <div className="text-center w-full p-2.5 sm:p-3.5 border-t border-white/10 bg-[#18181A] flex flex-col justify-between flex-1 relative z-20">
        <h3 className="text-[12px] sm:text-[13.5px] font-bold mb-1.5 truncate text-[#F5F5F7] tracking-tight group-hover:text-blue-400 transition-colors">
          {gift.name}
        </h3>
        
        <div className="flex justify-center items-center gap-1.5 mb-2 sm:mb-2.5">
          <DynamicNumber value={gift.priceStars || gift.priceGram} imageClassName="h-3.5 sm:h-4 font-black" />
          {gift.priceStars ? (
            <span className="text-[14px] sm:text-[16px]">⭐️</span>
          ) : (
            <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover shrink-0 shadow-sm" />
          )}
        </div>
        
        <div className="w-full bg-[#0D0D0F] h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${(gift.remainingSupply / gift.totalSupply) * 100}%` }}></div>
        </div>
        <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10.5px] text-[#8E8E93] mt-1.5 font-medium">
          <DynamicNumber value={gift.remainingSupply} imageClassName="h-2.5 sm:h-3" />
          <span className="text-[#5C5C5E] mx-0.5">/</span>
          <DynamicNumber value={gift.totalSupply} imageClassName="h-2.5 sm:h-3" />
          <span className="uppercase text-[7.5px] sm:text-[8.5px] tracking-wider text-[#8E8E93] ml-0.5 font-bold">Left</span>
        </div>
      </div>
    </motion.button>
  );
}
