import React from 'react';
import { motion } from 'motion/react';

interface ReferralBannerProps {
  userId: string;
  onOpenReferralHub: () => void;
}

export function ReferralBanner({ userId, onOpenReferralHub }: ReferralBannerProps) {
  return (
    <div 
      onClick={onOpenReferralHub}
      className="w-full flex justify-center cursor-pointer group py-0 select-none"
    >
      <motion.img 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        src="https://i.suar.me/6z9vA/l" 
        alt="Referral Program" 
        className="w-full max-w-md h-auto object-contain drop-shadow-lg transition-all duration-300"
      />
    </div>
  );
}
