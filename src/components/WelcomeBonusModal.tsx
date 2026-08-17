import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeBonusModal({ isOpen, onClose }: WelcomeBonusModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FBBF24', '#F59E0B', '#D97706']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FBBF24', '#F59E0B', '#D97706']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="bg-[#1C1C1E] border border-amber-500/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              
              <div className="p-8 text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <Gift className="w-10 h-10 text-amber-400" />
                </div>
                
                <h2 className="text-2xl font-black text-white mb-2">Welcome Gift!</h2>
                <p className="text-[#8E8E93] text-sm mb-6 leading-relaxed">
                  Thank you for joining us. We've added a special welcome bonus to your account so you can start right away!
                </p>
                
                <div className="flex items-center justify-center gap-2 bg-[#141416] py-3 px-6 rounded-2xl border border-[#2C2C2E] w-full mb-6">
                  <span className="text-3xl font-black text-amber-400">3,000</span>
                  <span className="text-xl">⭐️</span>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-amber-950 text-sm font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
