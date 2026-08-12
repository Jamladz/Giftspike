import React from 'react';
import { cn } from '../lib/utils';

const digitImages: Record<string, string> = {
  '0': 'https://i.suar.me/Oz3eB/l',
  '1': 'https://i.suar.me/dpB0l/l',
  '2': 'https://i.suar.me/Nz8q4/l',
  '3': 'https://i.suar.me/lp164/l',
  '4': 'https://i.suar.me/j52BW/l',
  '5': 'https://i.suar.me/evQG4/l',
  '6': 'https://i.suar.me/qnOpV/l',
  '7': 'https://i.suar.me/8104n/l',
  '8': 'https://i.suar.me/3AY9n/l',
  '9': 'https://i.suar.me/rpdXl/l',
};

interface DynamicNumberProps {
  value: number | string;
  className?: string;
  imageClassName?: string;
}

export function DynamicNumber({ value, className, imageClassName }: DynamicNumberProps) {
  const chars = String(value).split('');
  
  return (
    <div className={cn("inline-flex items-center justify-center gap-[1px] select-none align-middle shrink-0", className)}>
      {chars.map((char, index) => {
        if (digitImages[char]) {
          return (
            <img 
              key={index} 
              src={digitImages[char]} 
              alt={char} 
              className={cn("h-4 w-auto object-contain shrink-0 pointer-events-none drop-shadow-sm transition-all", imageClassName)} 
              loading="eager"
            />
          );
        }
        return (
          <span 
            key={index} 
            className={cn("text-[#F5F5F7] font-black leading-none px-[0.5px] text-xs flex items-center justify-center self-center", imageClassName)}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

