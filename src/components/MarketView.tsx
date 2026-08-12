import React, { useState } from 'react';
import { DynamicNumber } from './DynamicNumber';
import { Gift } from '../types';
import { Store, TrendingUp, Search, SlidersHorizontal, ArrowUpRight, Tag, Hash, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface MarketViewProps {
  onSelectGift: (gift: Gift) => void;
}

export function MarketView({ onSelectGift }: MarketViewProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LEGENDARY' | 'RARE' | 'OFFICIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample MRKT Listings with fixed models, backgrounds, serial numbers and percentages
  const marketListings: (Gift & {
    serialNumber: number;
    background: string;
    backgroundName: string;
    backgroundRarity: string;
    modelUrl: string;
    modelName: string;
    modelRarity: string;
    isMrktListing: boolean;
    seller: string;
    rarity: 'LEGENDARY' | 'RARE' | 'OFFICIAL';
  })[] = [
    {
      id: 'mrkt-1',
      name: 'Tele GT',
      serialNumber: 42,
      image: 'https://i.suar.me/ZzXKJ/l',
      modelUrl: 'https://i.suar.me/ZzXKJ/l',
      modelName: 'Golden Luxury',
      modelRarity: '5%',
      background: 'https://i.suar.me/V9BKK/l',
      backgroundName: 'Gold',
      backgroundRarity: '2%',
      priceGram: 85,
      seller: 'pavel_d',
      rarity: 'LEGENDARY',
      totalSupply: 1000,
      remainingSupply: 0,
      status: 'SOLD_OUT',
      createdAt: new Date().toISOString(),
      isMrktListing: true,
    },
    {
      id: 'mrkt-2',
      name: 'Tele GT',
      serialNumber: 142,
      image: 'https://i.suar.me/0poq0/l',
      modelUrl: 'https://i.suar.me/0poq0/l',
      modelName: 'Stealth Black',
      modelRarity: '15%',
      background: 'https://i.suar.me/Lpozo/l',
      backgroundName: 'Black',
      backgroundRarity: '5%',
      priceGram: 45,
      seller: 'alex_ton',
      rarity: 'RARE',
      totalSupply: 1000,
      remainingSupply: 0,
      status: 'SOLD_OUT',
      createdAt: new Date().toISOString(),
      isMrktListing: true,
    },
    {
      id: 'mrkt-3',
      name: 'Tele GT',
      serialNumber: 258,
      image: 'https://i.suar.me/ApeYO/l',
      modelUrl: 'https://i.suar.me/ApeYO/l',
      modelName: 'Cyber Green',
      modelRarity: '20%',
      background: 'https://i.suar.me/MpVKv/l',
      backgroundName: 'Red',
      backgroundRarity: '8%',
      priceGram: 32,
      seller: 'crypto_cat',
      rarity: 'RARE',
      totalSupply: 1000,
      remainingSupply: 0,
      status: 'SOLD_OUT',
      createdAt: new Date().toISOString(),
      isMrktListing: true,
    },
    {
      id: 'mrkt-4',
      name: 'Tele GT',
      serialNumber: 7,
      image: 'https://i.suar.me/Gn3GN/l',
      modelUrl: 'https://i.suar.me/Gn3GN/l',
      modelName: 'Neon Pink',
      modelRarity: '25%',
      background: 'https://i.suar.me/2zOW9/l',
      backgroundName: 'Burgundy',
      backgroundRarity: '15%',
      priceGram: 120,
      seller: 'durov_official',
      rarity: 'LEGENDARY',
      totalSupply: 1000,
      remainingSupply: 0,
      status: 'SOLD_OUT',
      createdAt: new Date().toISOString(),
      isMrktListing: true,
    },
  ];

  const filteredListings = marketListings.filter((item) => {
    const matchesFilter =
      activeFilter === 'ALL' || item.rarity === activeFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `#${item.serialNumber}`.includes(searchQuery) ||
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase());
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
              <DynamicNumber value={32} imageClassName="h-3" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
            </div>
          </div>
          <div className="border-x border-[#3A3A3C]/60">
            <p className="text-[9px] uppercase font-bold text-[#8E8E93]">24h Volume</p>
            <div className="flex items-center justify-center gap-1 font-bold text-sm text-[#F5F5F7] mt-0.5">
              <DynamicNumber value="8,420" imageClassName="h-3" />
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
            placeholder="Search MRKT by model, hashtag #042..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F7] placeholder-[#8E8E93] focus:outline-none focus:border-[#0088CC]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {(['ALL', 'LEGENDARY', 'RARE', 'OFFICIAL'] as const).map((filter) => (
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectGift(item as Gift)}
            className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] hover:border-[#0088CC]/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-square bg-[#161618] rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden border border-[#2C2C2E]">
                {/* Background image */}
                <img
                  src={item.background}
                  alt="background"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                
                {/* Car Model Overlay */}
                <img
                  src={item.modelUrl}
                  alt={item.name}
                  className="relative z-10 w-20 h-20 object-contain drop-shadow-xl group-hover:scale-105 transition-transform"
                />

                {/* Serial Hashtag Badge */}
                <span className="absolute top-1.5 right-1.5 z-20 text-[9px] font-black bg-black/60 backdrop-blur-md text-amber-400 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                  #{item.serialNumber}
                </span>

                {/* Seller Tag */}
                <span className="absolute bottom-1.5 left-1.5 z-20 text-[8px] font-bold bg-black/50 backdrop-blur-md text-[#8E8E93] px-1.5 py-0.5 rounded">
                  @{item.seller}
                </span>
              </div>

              {/* Title with Serial */}
              <p className="text-xs font-bold text-[#F5F5F7] truncate">{item.name} #{item.serialNumber}</p>
              
              {/* Trait badges */}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-[9px] text-[#8E8E93] bg-[#252528] px-1.5 py-0.5 rounded border border-[#3A3A3C] truncate max-w-[90px]">
                  {item.modelName}
                </span>
                <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 font-mono shrink-0">
                  {item.backgroundName} ({item.backgroundRarity})
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#2C2C2E] flex items-center justify-between">
              <div>
                <p className="text-[9px] text-[#8E8E93] font-medium">Price</p>
                <div className="flex items-center gap-1 font-bold text-xs text-[#F5F5F7]">
                  <DynamicNumber value={item.priceGram} imageClassName="h-3" />
                  <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#0088CC] text-white flex items-center justify-center shadow-md group-hover:bg-[#0099EE] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

