import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#1C1C1E] border-t border-[#3A3A3C] z-50 rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.6)]"
          >
            {/* Handle Overlay */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
              <div className="w-8 h-1 bg-white/40 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
