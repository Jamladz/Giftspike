import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    url: 'https://i.suar.me/V9Bor/l',
    title: 'Exclusive Drops',
    tag: 'Limited Edition'
  },
  {
    id: 2,
    url: 'https://i.suar.me/g465Q/l',
    title: 'Marketplace Deals',
    tag: 'Special Offer'
  }
];

const AUTOPLAY_DURATION = 4000; // 4 seconds

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    scale: 1.05,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    scale: 0.95,
    opacity: 0,
    filter: 'blur(4px)',
  })
};

export function GiftSlider() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentIndex = Math.abs(page % SLIDES.length);

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    setProgress(0);
  }, []);

  // Autoplay and progress bar logic
  useEffect(() => {
    if (isHovered) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= AUTOPLAY_DURATION) {
        paginate(1);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isHovered, page, paginate]);

  const handleDragEnd = (_: any, { offset, velocity }: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeConfidenceThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (swipePower < -swipeConfidenceThreshold || offset.x < -100) {
      paginate(1);
    } else if (swipePower > swipeConfidenceThreshold || offset.x > 100) {
      paginate(-1);
    }
  };

  return (
    <div
      className="relative w-full aspect-[21/9] sm:aspect-[24/8] rounded-2xl overflow-hidden bg-[#18181B] border border-white/10 mb-6 shadow-2xl shadow-blue-950/20 group select-none touch-pan-y"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 32 },
              opacity: { duration: 0.4 },
              scale: { duration: 0.5 },
              filter: { duration: 0.3 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            <motion.img
              src={SLIDES[currentIndex].url}
              alt={SLIDES[currentIndex].title}
              className="w-full h-full object-cover pointer-events-none"
              animate={{ scale: isHovered ? 1.04 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Gradients & Vibe Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/6 pointer-events-none bg-gradient-to-r from-black/30 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/6 pointer-events-none bg-gradient-to-l from-black/30 to-transparent" />

      {/* Navigation Arrow Buttons */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous Slide"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-black/60"
      >
        <ChevronLeft className="w-5 h-5 -ml-0.5" />
      </button>

      <button
        onClick={() => paginate(1)}
        aria-label="Next Slide"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-black/60"
      >
        <ChevronRight className="w-5 h-5 -mr-0.5" />
      </button>

      {/* Bottom Controls Bar (Pagination Dots & Auto Progress) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 shadow-xl">
        {SLIDES.map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => {
                const diff = idx - currentIndex;
                if (diff !== 0) paginate(diff);
              }}
              className="relative h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-none"
              style={{ width: isActive ? '24px' : '8px' }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className={`absolute inset-0 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/40 hover:bg-white/70'}`} />
              {isActive && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Accent Glow Bar */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none" />
    </div>
  );
}

