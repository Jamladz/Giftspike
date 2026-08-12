import React from 'react';
import { Gift, CheckSquare, Store, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
    { id: 'gifts', icon: Gift, label: 'Gifts' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'mrkt', icon: Store, label: 'MRKT' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-[#2C2C2E] pb-safe z-30">
      <div className="flex items-center justify-around h-20 px-6 max-w-5xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full gap-1 transition-all",
                isActive ? "text-[#0088CC]" : "text-[#8E8E93] opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn("w-6 h-6 rounded flex items-center justify-center", isActive && "bg-[#0088CC]/10")}>
                <Icon className={cn("w-5 h-5", isActive && "fill-[#0088CC]/20")} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
