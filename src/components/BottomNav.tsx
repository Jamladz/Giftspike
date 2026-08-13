import React from 'react';
import { Gift, CheckSquare, Users, Store, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
    { id: 'gifts', icon: Gift, label: 'Gifts' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'referral', icon: Users, label: 'Friends' },
    { id: 'mrkt', icon: Store, label: 'MRKT' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121215]/90 backdrop-blur-2xl border-t border-white/10 pb-safe z-30 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-16 sm:h-18 px-4 max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 cursor-pointer select-none",
                isActive ? "text-blue-400 font-bold" : "text-[#8E8E93] hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-x-2 top-2 bottom-2 bg-blue-500/15 border border-blue-400/20 rounded-2xl -z-10 shadow-sm shadow-blue-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive ? "scale-110 text-blue-400 fill-blue-400/20" : "scale-100"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn("text-[10px] tracking-wide transition-colors", isActive ? "text-blue-400 font-extrabold" : "font-semibold")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
