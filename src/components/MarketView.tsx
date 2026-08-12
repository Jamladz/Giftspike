import React, { useState } from 'react';
import { DynamicNumber } from './DynamicNumber';
import { Gift } from '../types';
import { Store, TrendingUp, Search, SlidersHorizontal, ArrowUpRight, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

interface MarketViewProps {
  onSelectGift: (gift: Gift) => void;
}

export function MarketView({ onSelectGift }: MarketViewProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LEGENDARY' | 'RARE' | 'STARS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Marketplace Listings
  const marketListings = [
    {
      id: 'mrkt-1',
      name: 'Telegram Star #849',
      image: 'https://i.suar.me/ogamY/l',
      priceGram: 28,
      seller: 'alex_ton',
      rarity: 'RARE',
      totalSupply: 1000,
      remainingSupply: 1,
      status: 'AVAILABLE' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mrkt-2',
      name: 'Crystal Duck #042',
      image: 'https://i.suar.me/ogamY/l',
      priceGram: 65,
      seller: 'pavel_d',
      rarity: 'LEGENDARY',
      totalSupply: 500,
      remainingSupply: 1,
      status: 'LIMITED' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mrkt-3',
      name: 'Cyber Sticker #1102',
      image: 'https://i.suar.me/ogamY/l',
      priceGram: 18,
      seller: 'crypto_cat',
      rarity: 'STARS',
      totalSupply: 5000,
      remainingSupply: 1,
      status: 'AVAILABLE' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  const filteredListings = marketListings.filter((item) => {
    const matchesFilter =
      activeFilter === 'ALL' || item.rarity === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Marketplace Banner */}
      <div className="bg-gradient-to-br from-[#1C1C1E] via-[#2A2A2E] to-[#141417] rounded-3xl p-5 border border-[#3A3A3C] shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-[#0088CC]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                Peer-to-Peer
              </span>
              <span className="text-xs text-[#8E8E93]">P2P Trading</span>
            </div>
            <h2 className="text-2xl font-black text-[#F5F5F7] tracking-tight">Gifts MRKT</h2>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#0088CC]/10 border border-[#0088CC]/30 flex items-center justify-center text-[#0088CC]">
            <Store className="w-5 h-5" />
          </div>
        </div>

        {/* Market Stats Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#3A3A3C]/60 text-center">
          <div>
            <p className="text-[9px] uppercase font-bold text-[#8E8E93]">Floor Price</p>
            <div className="flex items-center justify-center gap-1 font-bold text-sm text-[#F5F5F7] mt-0.5">
              <DynamicNumber value={18} imageClassName="h-3" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            </div>
          </div>
          <div className="border-x border-[#3A3A3C]/60">
            <p className="text-[9px] uppercase font-bold text-[#8E8E93]">24h Volume</p>
            <div className="flex items-center justify-center gap-1 font-bold text-sm text-[#F5F5F7] mt-0.5">
              <DynamicNumber value="4,820" imageClassName="h-3" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-[#8E8E93]">Listed</p>
            <div className="flex justify-center mt-0.5">
              <DynamicNumber value={142} imageClassName="h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Search MRKT listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none focus:border-[#0088CC]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {(['ALL', 'LEGENDARY', 'RARE', 'STARS'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border',
                activeFilter === filter
                  ? 'bg-[#0088CC] text-white border-[#0088CC]'
                  : 'bg-[#1C1C1E] text-[#8E8E93] border-[#2C2C2E] hover:border-[#3A3A3C]'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectGift(item as Gift)}
            className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] hover:border-[#0088CC]/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-square bg-[#161618] rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-[#2C2C2E]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-[#1C1C1E]/90 text-[#8E8E93] px-2 py-0.5 rounded-md border border-[#3A3A3C]">
                  @{item.seller}
                </span>
              </div>
              <p className="text-xs font-bold text-[#F5F5F7] truncate">{item.name}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#2C2C2E] flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[#8E8E93] font-medium">Price</p>
                <div className="flex items-center gap-1 font-bold text-xs text-[#F5F5F7]">
                  <DynamicNumber value={item.priceGram} imageClassName="h-3" />
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#0088CC] text-white flex items-center justify-center shadow-md">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
