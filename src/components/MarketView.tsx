import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DynamicNumber } from './DynamicNumber';
import { Gift } from '../types';
import { api } from '../lib/api';
import {
  Store,
  ArrowUpRight,
  CheckCircle2,
  History,
  Filter,
  X,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Layers,
  Flame,
  RefreshCw,
  ShoppingBag,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketViewProps {
  onSelectGift: (gift: Gift) => void;
  purchasedGiftIds?: string[];
  storeGifts?: Gift[];
  onGoToGifts?: () => void;
  userId?: string;
  userGram?: number;
  onUpdateGram?: (gram: number | ((prev: number) => number)) => void;
}

// Authentic Telegram Username Pools (Arab, Western, Russian in English)
const ARAB_TELEGRAM_USERS = [
  'ahmed_dxb', 'sultan_crypto', 'mouad_nft', 'tariq_gram', 'faisal_ksa',
  'omar_ton', 'zayd_dubai', 'youssef_v', 'hamdan_vip', 'rashid_tg', 'khalid_uae',
  'saud_ton', 'mansour_dxb', 'nasser_gram', 'nabil_ton', 'badr_crypto'
];

const WESTERN_TELEGRAM_USERS = [
  'alex_crypto', 'crypto_sam', 'luke_whales', 'sarah_ton', 'dylan_gifts',
  'emma_collector', 'oliver_gram', 'eth_maxi', 'jack_ton', 'michael_v',
  'mason_tg', 'charlotte_nft', 'ethan_ton', 'liam_whales', 'noah_trader'
];

const RUSSIAN_TELEGRAM_USERS = [
  'pavel_ton', 'dmitry_v', 'nikita_mkt', 'artem_spb', 'vladislav_ton',
  'ivan_tg', 'mikhail_nft', 'sergey_gram', 'anton_ru', 'maxim_ton',
  'roman_msk', 'egor_ton', 'kirill_whales', 'andrey_tg', 'fedor_ton'
];

const ALL_TELEGRAM_BOTS = [
  ...ARAB_TELEGRAM_USERS,
  ...WESTERN_TELEGRAM_USERS,
  ...RUSSIAN_TELEGRAM_USERS
];

const ALL_MODELS = [
  { name: 'Golden Luxury', giftName: 'Tele GT', url: 'https://i.suar.me/ZzXKJ/l', rarity: '5%', basePrice: 200 },
  { name: 'Stealth Black', giftName: 'Tele GT', url: 'https://i.suar.me/0poq0/l', rarity: '15%', basePrice: 100 },
  { name: 'Cyber Green', giftName: 'Tele GT', url: 'https://i.suar.me/ApeYO/l', rarity: '20%', basePrice: 60 },
  { name: 'Neon Pink', giftName: 'Tele GT', url: 'https://i.suar.me/Gn3GN/l', rarity: '25%', basePrice: 40 },
  { name: 'Classic Blue', giftName: 'Tele GT', url: 'https://i.suar.me/ogamY/l', rarity: '35%', basePrice: 30 },
  { name: 'Diamond Cannon', giftName: 'Cash Cannon', url: 'https://i.suar.me/WPBxr/l', rarity: '5%', basePrice: 100 },
  { name: 'Cyber Blaster', giftName: 'Cash Cannon', url: 'https://i.suar.me/PpMOQ/l', rarity: '15%', basePrice: 50 },
  { name: 'Ruby Launcher', giftName: 'Cash Cannon', url: 'https://i.suar.me/EpjKx/l', rarity: '20%', basePrice: 30 },
  { name: 'Neon Cash', giftName: 'Cash Cannon', url: 'https://i.suar.me/vAdEW/l', rarity: '25%', basePrice: 20 },
  { name: 'Gold Standard', giftName: 'Cash Cannon', url: 'https://i.suar.me/6z9Ka/l', rarity: '35%', basePrice: 15 },
  { name: 'Argentina', giftName: 'Champion Bear', url: 'https://i.suar.me/Npgv0/l', rarity: '20%', basePrice: 10 },
  { name: 'Spain', giftName: 'Champion Bear', url: 'https://i.suar.me/lZBEl/l', rarity: '20%', basePrice: 8 },
  { name: 'Brazil', giftName: 'Champion Bear', url: 'https://i.suar.me/Op9jM/l', rarity: '20%', basePrice: 5 },
  { name: 'England', giftName: 'Champion Bear', url: 'https://i.suar.me/e9BpG/l', rarity: '20%', basePrice: 3 },
  { name: 'Norway', giftName: 'Champion Bear', url: 'https://i.suar.me/qvlEx/l', rarity: '20%', basePrice: 2 },
  { name: 'Cristiano Real Madrid', giftName: 'Goal King', url: 'https://i.suar.me/YQBgJ/l', rarity: '10%', basePrice: 110 },
  { name: 'Mbappe France', giftName: 'Goal King', url: 'https://i.suar.me/zXrP4/l', rarity: '10%', basePrice: 85 },
  { name: 'Mbappe PSG', giftName: 'Goal King', url: 'https://i.suar.me/0porv/l', rarity: '10%', basePrice: 60 },
  { name: 'Haaland Norway', giftName: 'Goal King', url: 'https://i.suar.me/4z5wA/l', rarity: '10%', basePrice: 40 },
  { name: 'Messi Barcelona', giftName: 'Goal King', url: 'https://i.suar.me/ZzX9z/l', rarity: '15%', basePrice: 20 },
  { name: 'Haaland Man City', giftName: 'Goal King', url: 'https://i.suar.me/Gn32d/l', rarity: '15%', basePrice: 10 },
  { name: 'Messi Argentina', giftName: 'Goal King', url: 'https://i.suar.me/ApeyB/l', rarity: '15%', basePrice: 6 },
  { name: 'Cristiano Ronaldo Portugal', giftName: 'Goal King', url: 'https://i.suar.me/Jpxl7/l', rarity: '15%', basePrice: 4 },
];

const BACKGROUND_OPTIONS = [
  { name: 'Gold', hex: '#E2B857', border: '#FACC15', rarity: '2%', bonus: 40, url: 'https://i.suar.me/V9BKK/l' },
  { name: 'Black', hex: '#18181B', border: '#52525B', rarity: '5%', bonus: 20, url: 'https://i.suar.me/Lpozo/l' },
  { name: 'Red', hex: '#EF4444', border: '#F87171', rarity: '8%', bonus: 10, url: 'https://i.suar.me/MpVKv/l' },
  { name: 'Burgundy', hex: '#881337', border: '#BE123C', rarity: '15%', bonus: 5, url: 'https://i.suar.me/2zOW9/l' },
  { name: 'Green', hex: '#22C55E', border: '#4ADE80', rarity: '15%', bonus: 3, url: 'https://i.suar.me/8zo1y/l' },
  { name: 'Purple', hex: '#A855F7', border: '#C084FC', rarity: '15%', bonus: 2, url: 'https://i.suar.me/9zJo7/l' },
  { name: 'Cyan', hex: '#06B6D4', border: '#22D3EE', rarity: '15%', bonus: 1, url: 'https://i.suar.me/YQBX9/l' },
  { name: 'Orange', hex: '#F97316', border: '#FB923C', rarity: '25%', bonus: 0, url: 'https://i.suar.me/g46m5/l' },
];

const POPULAR_HASHTAGS = [1, 7, 42, 88, 142, 258, 404, 777, 888];

// Realistically Timed Sold History Generator
const REALISTIC_SOLD_TIMES = [
  'Just now', '1m ago', '2m ago', '3m ago', '5m ago', '8m ago', '12m ago', '15m ago',
  '20m ago', '30m ago', '45m ago', '1h ago', '1h 30m ago', '2h ago', '3h ago', '5h ago', 
  '8h ago', '12h ago', '18h ago', '1d ago', '1d 6h ago', '2d ago', '2d 12h ago', '3d ago',
  '4d ago', '5d ago', '6d ago', '1w ago', '1w 2d ago', '1w 5d ago', '2w ago', '3w ago', '1mo ago'
];

// Helper to calculate pricing based on attributes & rarity
function calculateItemPrice(model: typeof ALL_MODELS[0], bg: typeof BACKGROUND_OPTIONS[0], serial: number): number {
  let price = model.basePrice + bg.bonus;
  
  if (serial === 1) {
    price *= 3.8;
  } else if (serial <= 10) {
    price *= 2.2;
  } else if ([42, 77, 88, 100, 142, 258, 404, 777, 888, 999].includes(serial)) {
    price *= 1.5;
  }

  // Add subtle realistic market variance (-12% to +15%)
  const variance = 0.88 + Math.random() * 0.27;
  const minFloor = model.giftName === 'Goal King' ? 4 : model.giftName === 'Champion Bear' ? 4 : model.giftName === 'Cash Cannon' ? 8 : 15;
  return Math.max(minFloor, Math.round(price * variance));
}

const ALL_GIFT_NAMES = ['Tele GT', 'Cash Cannon', 'Champion Bear', 'Goal King'];

// Generate Realistic Active Market Listings
function generateActiveListings(count = 360, availableGiftNames: string[] = ALL_GIFT_NAMES) {
  const items = [];
  const validNames = availableGiftNames.length > 0 ? availableGiftNames : ALL_GIFT_NAMES;
  for (let i = 1; i <= count; i++) {
    const giftName = validNames[i % validNames.length] || 'Champion Bear';
    const availableModels = ALL_MODELS.filter(m => m.giftName === giftName);
    const model = availableModels.length > 0
      ? availableModels[Math.floor(Math.random() * availableModels.length)]
      : ALL_MODELS[0];
    const bg = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)];
    const seller = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
    
    // Serial number logic
    let serialNumber: number;
    if (i <= 10) {
      serialNumber = POPULAR_HASHTAGS[i % POPULAR_HASHTAGS.length];
    } else {
      serialNumber = Math.floor(Math.random() * 950) + 1;
    }

    const priceGram = calculateItemPrice(model, bg, serialNumber);

    items.push({
      id: `mrkt-act-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name: giftName,
      serialNumber,
      image: model.url,
      modelUrl: model.url,
      modelName: model.name,
      modelRarity: model.rarity,
      background: bg.url,
      backgroundName: bg.name,
      backgroundRarity: bg.rarity,
      priceGram,
      seller,
      totalSupply: giftName === 'Champion Bear' ? 300000 : giftName === 'Tele GT' ? 1000 : 2000,
      remainingSupply: 1,
      status: 'AVAILABLE' as const,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
      isMrktListing: true,
    });
  }
  return items;
}

// Generate Realistic Sold Market Listings with Timestamps
function generateSoldListings(count = 180, availableGiftNames: string[] = ALL_GIFT_NAMES) {
  const items = [];
  const validNames = availableGiftNames.length > 0 ? availableGiftNames : ALL_GIFT_NAMES;
  for (let i = 1; i <= count; i++) {
    const giftName = validNames[i % validNames.length] || 'Champion Bear';
    const availableModels = ALL_MODELS.filter(m => m.giftName === giftName);
    const model = availableModels.length > 0
      ? availableModels[Math.floor(Math.random() * availableModels.length)]
      : ALL_MODELS[0];
    const bg = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)];
    
    let seller = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
    let buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
    while (buyer === seller) {
      buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
    }

    const serialNumber = Math.floor(Math.random() * 950) + 1;
    const priceGram = calculateItemPrice(model, bg, serialNumber);

    // Pick realistic time based on index distribution
    let soldAt: string;
    if (i <= 2) {
      soldAt = REALISTIC_SOLD_TIMES[i]; // Just now, 1m, 2m
    } else if (i <= 10) {
      soldAt = REALISTIC_SOLD_TIMES[3 + Math.floor((i - 3) % 8)]; // 3m to 45m
    } else if (i <= 30) {
      soldAt = REALISTIC_SOLD_TIMES[11 + Math.floor((i - 10) % 8)]; // 1h to 18h
    } else if (i <= 80) {
      soldAt = REALISTIC_SOLD_TIMES[19 + Math.floor((i - 30) % 8)]; // 1d to 1w
    } else {
      soldAt = REALISTIC_SOLD_TIMES[27 + Math.floor((i - 80) % 6)]; // 1w to 1mo
    }

    items.push({
      id: `mrkt-sold-${i}-${Math.random().toString(36).substring(2, 6)}`,
      name: giftName,
      serialNumber,
      image: model.url,
      modelUrl: model.url,
      modelName: model.name,
      modelRarity: model.rarity,
      background: bg.url,
      backgroundName: bg.name,
      backgroundRarity: bg.rarity,
      priceGram,
      seller,
      buyer,
      soldAt,
      totalSupply: giftName === 'Champion Bear' ? 300000 : giftName === 'Tele GT' ? 1000 : 2000,
      remainingSupply: 0,
      status: 'SOLD_OUT' as const,
      createdAt: new Date().toISOString(),
      isMrktListing: true,
    });
  }
  return items;
}

export function MarketView({ onSelectGift, purchasedGiftIds, storeGifts, onGoToGifts, userId, userGram, onUpdateGram }: MarketViewProps) {
  const [tab, setTab] = useState<'ACTIVE' | 'SOLD'>('ACTIVE');

  // Advanced Filter States
  const [selectedGiftName, setSelectedGiftName] = useState<string>('ALL');
  const [selectedModel, setSelectedModel] = useState<string>('ALL');
  const [selectedBackground, setSelectedBackground] = useState<string>('ALL');
  const [selectedHashtag, setSelectedHashtag] = useState<number | 'ALL'>('ALL');

  // Dropdown Open State
  const [activeDropdown, setActiveDropdown] = useState<'NONE' | 'GIFT' | 'MODEL' | 'BG' | 'HASHTAG'>('NONE');
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState<boolean>(true);

  // Pagination / Display Batch State
  const [displayLimit, setDisplayLimit] = useState(28);

  // Active Market Listings State (includes all gifts: Tele GT, Cash Cannon, Champion Bear)
  useEffect(() => {
    const handleNewListing = (e: any) => {
       const newListing = e.detail;
       if (newListing) {
         setActiveMarketListings(prev => [newListing, ...prev]);
       }
    };
    const handleRemoveListing = (e: any) => {
       const id = e.detail;
       if (id) {
         setActiveMarketListings(prev => prev.filter(l => l.id !== id));
       }
    };
    window.addEventListener('market_listing_added', handleNewListing);
    window.addEventListener('market_listing_removed', handleRemoveListing);
    return () => {
      window.removeEventListener('market_listing_added', handleNewListing);
      window.removeEventListener('market_listing_removed', handleRemoveListing);
    };
  }, []);

  const [activeMarketListings, setActiveMarketListings] = useState(() => {
    const saved = localStorage.getItem('market_active_listings');
    let parsed = saved ? JSON.parse(saved) : null;
    if (parsed && (!parsed.some((i: any) => i.name === 'Tele GT') || !parsed.some((i: any) => i.name === 'Cash Cannon'))) {
      parsed = null; // Re-seed with all gifts
    }
    return parsed || generateActiveListings(360, ALL_GIFT_NAMES);
  });

  // Sold Items History State (includes all gifts: Tele GT, Cash Cannon, Champion Bear)
  const [soldMarketListings, setSoldMarketListings] = useState(() => {
    const saved = localStorage.getItem('market_sold_listings');
    let parsed = saved ? JSON.parse(saved) : null;
    if (parsed && (!parsed.some((i: any) => i.name === 'Tele GT') || !parsed.some((i: any) => i.name === 'Cash Cannon'))) {
      parsed = null; // Re-seed with all gifts
    }
    return parsed || generateSoldListings(180, ALL_GIFT_NAMES);
  });

  // Live Trading Engine Stats - Rolling 24h System
  const [recentTrades, setRecentTrades] = useState<{ts: number, amount: number}[]>(() => {
    const saved = localStorage.getItem('market_recent_trades');
    if (saved) return JSON.parse(saved);
    
    const seed = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 0; i < 450; i++) {
       const amount = Math.floor(Math.random() * 80) + 10; 
       const timeOffset = Math.pow(Math.random(), 1.5) * dayMs; 
       seed.push({ ts: now - timeOffset, amount });
    }
    return seed;
  });

  const recentTradesRef = useRef(recentTrades);
  useEffect(() => {
    recentTradesRef.current = recentTrades;
    localStorage.setItem('market_recent_trades', JSON.stringify(recentTrades));
  }, [recentTrades]);

  // Rolling 24h Cleanup Interval
  useEffect(() => {
    const cleanup = setInterval(() => {
       const now = Date.now();
       const dayMs = 24 * 60 * 60 * 1000;
       setRecentTrades(prev => {
          const filtered = prev.filter(t => (now - t.ts) < dayMs);
          return filtered.length === prev.length ? prev : filtered;
       });
    }, 15000);
    return () => clearInterval(cleanup);
  }, []);

  const tradeVolume = useMemo(() => recentTrades.reduce((sum, t) => sum + t.amount, 0), [recentTrades]);
  const tradeCount = recentTrades.length;

  const [latestTradeNotification, setLatestTradeNotification] = useState<{
    type: 'SALE' | 'LISTING';
    text: string;
    id: number;
  } | null>(null);

  // Queue of sold gifts bought by bots, waiting to be relisted at higher prices
  const flippableQueueRef = useRef<Array<{
    name: string;
    serialNumber: number;
    modelUrl: string;
    modelName: string;
    modelRarity: string;
    background: string;
    backgroundName: string;
    backgroundRarity: string;
    priceGram: number;
    buyer: string;
    totalSupply: number;
  }>>((() => {
    const saved = localStorage.getItem('market_flippable_queue');
    return saved ? JSON.parse(saved) : [];
  })());

  // Fetch real user listings from Firebase
  useEffect(() => {
    api.getMarketListings().then(listings => {
      if (listings && listings.length > 0) {
        setActiveMarketListings(prev => {
          const newIds = new Set(listings.map((l: any) => l.id));
          const filtered = prev.filter(p => !newIds.has(p.id));
          return [...listings, ...filtered];
        });
      }
    });
  }, []);

  // Save Market State to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('market_active_listings', JSON.stringify(activeMarketListings));
    localStorage.setItem('market_sold_listings', JSON.stringify(soldMarketListings));
    localStorage.setItem('market_flippable_queue', JSON.stringify(flippableQueueRef.current));
  }, [activeMarketListings, soldMarketListings]);

  // Remove user-purchased items from active listings and log in sold history
  useEffect(() => {
    if (purchasedGiftIds && purchasedGiftIds.length > 0) {
      setActiveMarketListings(prev => {
        const purchasedSet = new Set(purchasedGiftIds);
        const boughtItems = prev.filter(item => purchasedSet.has(item.id));
        if (boughtItems.length === 0) return prev;

        boughtItems.forEach(item => {
          const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
          const buyerName = tgUser?.first_name || tgUser?.username || 'You';
          const soldItem = {
            ...item,
            id: `sold-user-${Date.now()}-${item.id}`,
            buyer: buyerName,
            soldAt: 'Just now',
          };
          setSoldMarketListings(sPrev => [soldItem, ...sPrev]);
          setRecentTrades(tPrev => {
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;
            const filtered = tPrev.filter(t => (now - t.ts) < dayMs);
            return [...filtered, { ts: now, amount: item.priceGram }];
          });
        });

        return prev.filter(item => !purchasedSet.has(item.id));
      });
    }
  }, [purchasedGiftIds]);

  // Reset pagination display limit when filters or tab change
  useEffect(() => {
    setDisplayLimit(28);
  }, [tab, selectedGiftName, selectedModel, selectedBackground, selectedHashtag]);

  // Realistic Bot Engine (Simulated Catch-up & Dynamic Intervals)
  const activeMarketListingsRef = useRef(activeMarketListings);
  useEffect(() => {
    activeMarketListingsRef.current = activeMarketListings;
  }, [activeMarketListings]);

  // Catch up missing time from when user last closed the app
  useEffect(() => {
    const lastSeenStr = localStorage.getItem('market_last_seen_ts');
    const now = Date.now();
    
    if (lastSeenStr) {
      const lastSeen = parseInt(lastSeenStr);
      const diffSecs = Math.floor((now - lastSeen) / 1000);
      
      // If away for more than 30 seconds
      if (diffSecs > 30) {
        let missedTrades = Math.floor(diffSecs / 25); // roughly 1 trade every 6s average
        if (missedTrades > 200) missedTrades = 200; // Cap to 200 max to avoid lag
        
        if (missedTrades > 0) {
          setActiveMarketListings(prevActive => {
            let currentActive = [...prevActive];
            
            let currentSoldStr = localStorage.getItem('market_sold_listings');
            let currentSold = currentSoldStr ? JSON.parse(currentSoldStr) : soldMarketListings;
            
            let currentRecentStr = localStorage.getItem('market_recent_trades');
            let currentRecent = currentRecentStr ? JSON.parse(currentRecentStr) : recentTrades;
            
            let flippable = flippableQueueRef.current;
            
            for (let i = 0; i < missedTrades; i++) {
               const activeCount = currentActive.length;
               if (activeCount === 0) break;
               
               const hasFlippableItems = flippable.length > 0;
               const rand = Math.random();
               const simulatedTimestamp = now - (missedTrades - i) * 25000;

               if (rand < 0.55 && activeCount > 5) {
                  const randomIndex = Math.floor(Math.random() * activeCount);
                  const itemToBuy = currentActive[randomIndex];
                  if (!ALL_TELEGRAM_BOTS.includes(itemToBuy.seller)) continue; // Bots don't buy from real users
                  
                  let buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
                  while (buyer === itemToBuy.seller) {
                    buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
                  }
                  
                  const isRealUser = !ALL_TELEGRAM_BOTS.includes(itemToBuy.seller);
                  if (isRealUser && onUpdateGram) {
                    onUpdateGram((prev: number) => prev + itemToBuy.priceGram);
                  }

                  const soldItem = {
                    ...itemToBuy,
                    id: `sold-sim-${simulatedTimestamp}-${Math.random().toString(36).substr(2, 4)}`,
                    buyer,
                    soldAt: 'Just now'
                  };
                  currentActive.splice(randomIndex, 1);
                  currentSold.unshift(soldItem);
                  
                  currentRecent.push({ ts: simulatedTimestamp, amount: itemToBuy.priceGram });
                  flippable.push({ ...itemToBuy, buyer });
                  
               } else if (hasFlippableItems && rand < 0.85) {
                  const flippedIndex = Math.floor(Math.random() * flippable.length);
                  const [flippedItem] = flippable.splice(flippedIndex, 1);
                  const markupPercent = 0.18 + Math.random() * 0.24;
                  const newPriceGram = Math.max(flippedItem.priceGram + 6, Math.round(flippedItem.priceGram * (1 + markupPercent)));
                  
                  const relistedItem = {
                    id: `mrkt-flip-${simulatedTimestamp}-${Math.random().toString(36).substr(2, 4)}`,
                    name: flippedItem.name,
                    serialNumber: flippedItem.serialNumber,
                    image: flippedItem.modelUrl,
                    modelUrl: flippedItem.modelUrl,
                    modelName: flippedItem.modelName,
                    modelRarity: flippedItem.modelRarity,
                    background: flippedItem.background,
                    backgroundName: flippedItem.backgroundName,
                    backgroundRarity: flippedItem.backgroundRarity,
                    priceGram: newPriceGram,
                    seller: flippedItem.buyer,
                    totalSupply: flippedItem.totalSupply,
                    remainingSupply: 1,
                    status: 'AVAILABLE' as const,
                    createdAt: new Date(simulatedTimestamp).toISOString(),
                    isMrktListing: true,
                  };
                  currentActive.unshift(relistedItem);
               } else {
                  const giftName = ALL_GIFT_NAMES[Math.floor(Math.random() * ALL_GIFT_NAMES.length)];
                  const matchingModels = ALL_MODELS.filter(m => m.giftName === giftName);
                  const randomModel = matchingModels.length > 0 ? matchingModels[Math.floor(Math.random() * matchingModels.length)] : ALL_MODELS[0];
                  const randomBg = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)];
                  const seller = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
                  const serialNumber = Math.floor(Math.random() * 950) + 1;
                  const priceGram = calculateItemPrice(randomModel, randomBg, serialNumber);
                  
                  const newListing = {
                    id: `mrkt-live-${simulatedTimestamp}-${Math.random().toString(36).substr(2, 4)}`,
                    name: giftName,
                    serialNumber,
                    image: randomModel.url,
                    modelUrl: randomModel.url,
                    modelName: randomModel.name,
                    modelRarity: randomModel.rarity,
                    background: randomBg.url,
                    backgroundName: randomBg.name,
                    backgroundRarity: randomBg.rarity,
                    priceGram,
                    seller,
                    totalSupply: giftName === 'Goal King' ? 100000 : giftName === 'Champion Bear' ? 300000 : giftName === 'Tele GT' ? 1000 : 2000,
                    remainingSupply: 1,
                    status: 'AVAILABLE' as const,
                    createdAt: new Date(simulatedTimestamp).toISOString(),
                    isMrktListing: true,
                  };
                  currentActive.unshift(newListing);
               }
            }
            
            // Clean up recent trades older than 24h
            const dayMs = 24 * 60 * 60 * 1000;
            currentRecent = currentRecent.filter(t => (now - t.ts) < dayMs);
            
            setSoldMarketListings(currentSold);
            setRecentTrades(currentRecent);
            return currentActive;
          });
        }
      }
    }
  }, []);

  // Constantly update last seen
  useEffect(() => {
    const i = setInterval(() => {
      localStorage.setItem('market_last_seen_ts', Date.now().toString());
    }, 5000);
    return () => clearInterval(i);
  }, []);

  // Realtime Live Bot Trading Engine (Professional dynamic pacing)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runEngine = () => {
      const currentActive = activeMarketListingsRef.current;
      const activeCount = currentActive.length;
      if (activeCount > 0) {
        const hasFlippableItems = flippableQueueRef.current.length > 0;
        const rand = Math.random();

        if (rand < 0.55 && activeCount > 5) {
          const randomIndex = Math.floor(Math.random() * activeCount);
          const itemToBuy = currentActive[randomIndex];
          
          if (ALL_TELEGRAM_BOTS.includes(itemToBuy.seller)) {
            let buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
            while (buyer === itemToBuy.seller) {
              buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
            }

            const isRealUser = !ALL_TELEGRAM_BOTS.includes(itemToBuy.seller);
            if (isRealUser && onUpdateGram) {
              onUpdateGram((prev: number) => prev + itemToBuy.priceGram);
            }

            const soldItem = {
              ...itemToBuy,
              id: `sold-live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              buyer,
              soldAt: 'Just now',
            };

            setActiveMarketListings(prev => prev.filter(item => item.id !== itemToBuy.id));
            setSoldMarketListings(prev => [soldItem, ...prev]);
            setRecentTrades(tPrev => {
              const now = Date.now();
              const dayMs = 24 * 60 * 60 * 1000;
              const filtered = tPrev.filter(t => (now - t.ts) < dayMs);
              return [...filtered, { ts: now, amount: itemToBuy.priceGram }];
            });
            
            flippableQueueRef.current.push({
              name: itemToBuy.name,
              serialNumber: itemToBuy.serialNumber,
              modelUrl: itemToBuy.modelUrl,
              modelName: itemToBuy.modelName,
              modelRarity: itemToBuy.modelRarity,
              background: itemToBuy.background,
              backgroundName: itemToBuy.backgroundName,
              backgroundRarity: itemToBuy.backgroundRarity,
              priceGram: itemToBuy.priceGram,
              buyer,
              totalSupply: itemToBuy.totalSupply,
            });

            setLatestTradeNotification({
              type: 'SALE',
              text: `⚡ @${itemToBuy.seller} ➔ @${buyer} bought ${itemToBuy.name} #${itemToBuy.serialNumber} for ${itemToBuy.priceGram} GRAM`,
              id: Date.now(),
            });
          }
        } else if (hasFlippableItems && rand < 0.85) {
          const flippedIndex = Math.floor(Math.random() * flippableQueueRef.current.length);
          const [flippedItem] = flippableQueueRef.current.splice(flippedIndex, 1);
          
          const markupPercent = 0.18 + Math.random() * 0.24;
          const newPriceGram = Math.max(flippedItem.priceGram + 6, Math.round(flippedItem.priceGram * (1 + markupPercent)));
          const seller = flippedItem.buyer; 

          const relistedItem = {
            id: `mrkt-flip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: flippedItem.name,
            serialNumber: flippedItem.serialNumber,
            image: flippedItem.modelUrl,
            modelUrl: flippedItem.modelUrl,
            modelName: flippedItem.modelName,
            modelRarity: flippedItem.modelRarity,
            background: flippedItem.background,
            backgroundName: flippedItem.backgroundName,
            backgroundRarity: flippedItem.backgroundRarity,
            priceGram: newPriceGram,
            seller,
            totalSupply: flippedItem.totalSupply,
            remainingSupply: 1,
            status: 'AVAILABLE' as const,
            createdAt: new Date().toISOString(),
            isMrktListing: true,
          };

          setActiveMarketListings(prev => [relistedItem, ...prev]);
          setLatestTradeNotification({
            type: 'LISTING',
            text: `🏷️ @${seller} relisted ${flippedItem.name} #${flippedItem.serialNumber} (${flippedItem.modelName}) for ${newPriceGram} GRAM (+${Math.round(markupPercent * 100)}%)`,
            id: Date.now(),
          });
        } else {
          const giftName = ALL_GIFT_NAMES[Math.floor(Math.random() * ALL_GIFT_NAMES.length)];
          const matchingModels = ALL_MODELS.filter(m => m.giftName === giftName);
          const randomModel = matchingModels.length > 0 ? matchingModels[Math.floor(Math.random() * matchingModels.length)] : ALL_MODELS[0];
          const randomBg = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)];
          const seller = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
          const serialNumber = Math.floor(Math.random() * 950) + 1;
          const priceGram = calculateItemPrice(randomModel, randomBg, serialNumber);
          
          const newListing = {
            id: `mrkt-live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: giftName,
            serialNumber,
            image: randomModel.url,
            modelUrl: randomModel.url,
            modelName: randomModel.name,
            modelRarity: randomModel.rarity,
            background: randomBg.url,
            backgroundName: randomBg.name,
            backgroundRarity: randomBg.rarity,
            priceGram,
            seller,
            totalSupply: giftName === 'Goal King' ? 100000 : giftName === 'Champion Bear' ? 300000 : giftName === 'Tele GT' ? 1000 : 2000,
            remainingSupply: 1,
            status: 'AVAILABLE' as const,
            createdAt: new Date().toISOString(),
            isMrktListing: true,
          };

          setActiveMarketListings(prev => [newListing, ...prev]);
          setLatestTradeNotification({
            type: 'LISTING',
            text: `🏷️ @${seller} listed ${giftName} #${serialNumber} (${randomModel.name}) for ${priceGram} GRAM`,
            id: Date.now(),
          });
        }
      }

      // Carefully studied dynamic pacing 
      // Mood determines the gap until the NEXT trade (Slowed down for realism)
      let nextDelay;
      const mood = Math.random();
      if (mood < 0.15) {
        // FOMO Burst Mode: 2s to 4s
        nextDelay = Math.floor(Math.random() * 2000) + 2000;
      } else if (mood < 0.6) {
        // Normal Activity: 10s to 18s
        nextDelay = Math.floor(Math.random() * 8000) + 10000;
      } else {
        // Slow Market Lull: 20s to 45s
        nextDelay = Math.floor(Math.random() * 25000) + 20000;
      }
      
      timeoutId = setTimeout(runEngine, nextDelay);
    };

    // Start engine with initial delay
    timeoutId = setTimeout(runEngine, Math.floor(Math.random() * 3000) + 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (!latestTradeNotification) return;
    const timeout = setTimeout(() => {
      setLatestTradeNotification(null);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [latestTradeNotification]);

  const currentListings = tab === 'ACTIVE' ? activeMarketListings : soldMarketListings;

  // Filter Logic over all 300+ items
  const filteredListings = useMemo(() => {
    const filtered = currentListings.filter((item) => {
      if (selectedGiftName !== 'ALL' && item.name !== selectedGiftName) return false;
      if (selectedModel !== 'ALL' && item.modelName !== selectedModel) return false;
      if (selectedBackground !== 'ALL' && item.backgroundName !== selectedBackground) return false;
      if (selectedHashtag !== 'ALL' && item.serialNumber !== selectedHashtag) return false;
      return true;
    });

    if (tab === 'ACTIVE') {
      return filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [currentListings, selectedGiftName, selectedModel, selectedBackground, selectedHashtag, tab]);

  const visibleListings = filteredListings.slice(0, displayLimit);

  const availableModels = selectedGiftName === 'ALL'
    ? ALL_MODELS
    : ALL_MODELS.filter((m) => m.giftName === selectedGiftName);

  const isFilterActive = selectedGiftName !== 'ALL' || selectedModel !== 'ALL' || selectedBackground !== 'ALL' || selectedHashtag !== 'ALL';

  const clearFilters = () => {
    setSelectedGiftName('ALL');
    setSelectedModel('ALL');
    setSelectedBackground('ALL');
    setSelectedHashtag('ALL');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Live Telegram Trading Bots Banner */}
      <div className="bg-gradient-to-r from-[#1C1C1E] via-[#252529] to-[#141417] rounded-2xl p-3 border border-[#3A3A3C] shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#0088CC]/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Title & Live Bot Status */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[#0088CC]/15 border border-[#0088CC]/30 flex items-center justify-center text-[#0088CC] shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-[#F5F5F7] tracking-tight leading-none">Gifts MRKT</h2>
              <span className="text-[9px] font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20 leading-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block" />
                300+ LIVE GIFTS
              </span>
            </div>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Active Telegram Floor Trading Engine</p>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3A3A3C]/60 text-center relative z-10 shrink-0">
          <div className="px-2">
            <p className="text-[8px] uppercase font-bold text-[#8E8E93]">Floor Price</p>
            <div className="flex items-center justify-center gap-0.5 font-bold text-xs text-[#F5F5F7] mt-0.5">
              <DynamicNumber value={24} imageClassName="h-2.5" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
            </div>
          </div>
          <div className="px-2 border-x border-[#3A3A3C]/60">
            <p className="text-[8px] uppercase font-bold text-[#8E8E93]">24h Volume</p>
            <div className="flex items-center justify-center gap-0.5 font-bold text-xs text-green-400 mt-0.5 font-mono">
              <DynamicNumber value={tradeVolume.toLocaleString('en-US')} imageClassName="h-2.5" />
              <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3 h-3 rounded-full object-cover shrink-0" />
            </div>
          </div>
          <div className="px-2">
            <p className="text-[8px] uppercase font-bold text-[#8E8E93]">24h Total Trades</p>
            <div className="flex justify-center mt-0.5 text-xs font-bold text-[#F5F5F7]">
              <DynamicNumber value={tradeCount.toLocaleString('en-US')} imageClassName="h-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Bot Activity Toast Notification */}
      <AnimatePresence>
        {latestTradeNotification && (
          <motion.div
            key={latestTradeNotification.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
              "px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs font-bold shadow-lg relative overflow-hidden backdrop-blur-md",
              latestTradeNotification.type === 'SALE'
                ? "bg-purple-950/90 border-purple-500/50 text-purple-200"
                : "bg-blue-950/90 border-blue-500/50 text-blue-200"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <span className={cn(
                "p-1 rounded-lg shrink-0",
                latestTradeNotification.type === 'SALE' ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
              )}>
                {latestTradeNotification.type === 'SALE' ? <Zap className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
              </span>
              <span className="truncate">{latestTradeNotification.text}</span>
            </div>
            <span className="text-[9px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded border border-white/10 shrink-0 ml-2">
              {latestTradeNotification.type === 'SALE' ? 'LIVE SALE' : 'NEW LISTING'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs: Active Listings vs Sold History */}
      <div className="flex items-center p-1 bg-[#161618] border border-[#2C2C2E] rounded-2xl">
        <button
          onClick={() => setTab('ACTIVE')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2',
            tab === 'ACTIVE'
              ? 'bg-[#0088CC] text-white shadow-md'
              : 'text-[#8E8E93] hover:text-[#F5F5F7]'
          )}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Active Listings ({activeMarketListings.length})</span>
        </button>
        <button
          onClick={() => setTab('SOLD')}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2',
            tab === 'SOLD'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-[#8E8E93] hover:text-[#F5F5F7]'
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>Sold Gifts ({soldMarketListings.length})</span>
        </button>
      </div>

      {/* Advanced Compact Dropdown Filters Section (Single Row Grid) */}
      <div className="bg-[#18181A] rounded-2xl p-2.5 border border-[#2C2C2E] shadow-sm relative z-30">
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#F5F5F7] hover:text-[#0088CC] transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-[#0088CC]" />
            <span>Filter 300+ Gifts</span>
            {isFilterPanelExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#8E8E93]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8E8E93] font-bold">
              Showing {visibleListings.length} of {filteredListings.length}
            </span>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {isFilterPanelExpanded && (
          <div className="grid grid-cols-4 gap-1.5 relative">
            {/* Overlay backdrop when a dropdown is open */}
            {activeDropdown !== 'NONE' && (
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setActiveDropdown('NONE')}
              />
            )}

            {/* 1. Gift Name Dropdown */}
            <div className="relative z-50">
              <label className="block text-[8px] sm:text-[9px] font-bold uppercase text-[#8E8E93] mb-0.5 truncate flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5 text-[#0088CC] shrink-0" />
                <span className="truncate">Gift Name</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'GIFT' ? 'NONE' : 'GIFT')}
                className={cn(
                  'w-full bg-[#222225] border rounded-xl px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center justify-between text-left transition-all',
                  selectedGiftName !== 'ALL'
                    ? 'border-[#0088CC] text-[#0088CC] bg-[#0088CC]/10'
                    : 'border-[#2C2C2E] text-[#F5F5F7] hover:border-[#3A3A3C]'
                )}
              >
                <span className="truncate">{selectedGiftName === 'ALL' ? 'All Gifts' : selectedGiftName}</span>
                <ChevronDown className="w-3 h-3 shrink-0 ml-0.5 text-[#8E8E93]" />
              </button>

              {activeDropdown === 'GIFT' && (
                <div className="absolute top-full left-0 mt-1 w-36 sm:w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-fadeIn">
                  <button
                    onClick={() => {
                      setSelectedGiftName('ALL');
                      setSelectedModel('ALL');
                      setActiveDropdown('NONE');
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                      selectedGiftName === 'ALL'
                        ? 'bg-[#0088CC] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                    )}
                  >
                    <span>All Gifts</span>
                    {selectedGiftName === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {ALL_GIFT_NAMES.map((name) => {
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          setSelectedGiftName(name);
                          setSelectedModel('ALL');
                          setActiveDropdown('NONE');
                        }}
                        className={cn(
                          'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                          selectedGiftName === name
                            ? 'bg-[#0088CC] text-white'
                            : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                          <span className="truncate">{name}</span>
                          <span className="text-[9px] text-[#8E8E93] font-mono shrink-0">
                            ({activeMarketListings.filter(item => item.name === name).length})
                          </span>
                        </div>
                        {selectedGiftName === name && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Model Dropdown */}
            <div className="relative z-50">
              <label className="block text-[8px] sm:text-[9px] font-bold uppercase text-[#8E8E93] mb-0.5 truncate flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate">Model</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'MODEL' ? 'NONE' : 'MODEL')}
                className={cn(
                  'w-full bg-[#222225] border rounded-xl px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center justify-between text-left transition-all',
                  selectedModel !== 'ALL'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-[#2C2C2E] text-[#F5F5F7] hover:border-[#3A3A3C]'
                )}
              >
                <span className="truncate">{selectedModel === 'ALL' ? 'All Models' : selectedModel}</span>
                <ChevronDown className="w-3 h-3 shrink-0 ml-0.5 text-[#8E8E93]" />
              </button>

              {activeDropdown === 'MODEL' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1 w-44 sm:w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 max-h-56 overflow-y-auto scrollbar-hide animate-fadeIn">
                  <button
                    onClick={() => {
                      setSelectedModel('ALL');
                      setActiveDropdown('NONE');
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                      selectedModel === 'ALL'
                        ? 'bg-[#0088CC] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                    )}
                  >
                    <span>All Models</span>
                    {selectedModel === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {availableModels.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => {
                        setSelectedModel(m.name);
                        setActiveDropdown('NONE');
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                        selectedModel === m.name
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img src={m.url} alt={m.name} className="w-4 h-4 object-contain shrink-0" />
                        <span className="truncate">{m.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#8E8E93] shrink-0">{m.rarity}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Background Color Dropdown */}
            <div className="relative z-50">
              <label className="block text-[8px] sm:text-[9px] font-bold uppercase text-[#8E8E93] mb-0.5 truncate flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 inline-block shrink-0" />
                <span className="truncate">Background</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'BG' ? 'NONE' : 'BG')}
                className={cn(
                  'w-full bg-[#222225] border rounded-xl px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center justify-between text-left transition-all',
                  selectedBackground !== 'ALL'
                    ? 'border-white/40 text-white bg-white/10'
                    : 'border-[#2C2C2E] text-[#F5F5F7] hover:border-[#3A3A3C]'
                )}
              >
                <div className="flex items-center gap-1 truncate">
                  {selectedBackground !== 'ALL' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border"
                      style={{
                        backgroundColor: BACKGROUND_OPTIONS.find(b => b.name === selectedBackground)?.hex,
                        borderColor: BACKGROUND_OPTIONS.find(b => b.name === selectedBackground)?.border
                      }}
                    />
                  )}
                  <span className="truncate">{selectedBackground === 'ALL' ? 'All Colors' : selectedBackground}</span>
                </div>
                <ChevronDown className="w-3 h-3 shrink-0 ml-0.5 text-[#8E8E93]" />
              </button>

              {activeDropdown === 'BG' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1 w-44 sm:w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 max-h-56 overflow-y-auto scrollbar-hide animate-fadeIn">
                  <button
                    onClick={() => {
                      setSelectedBackground('ALL');
                      setActiveDropdown('NONE');
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                      selectedBackground === 'ALL'
                        ? 'bg-[#0088CC] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                    )}
                  >
                    <span>All Colors</span>
                    {selectedBackground === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => {
                        setSelectedBackground(bg.name);
                        setActiveDropdown('NONE');
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                        selectedBackground === bg.name
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border shadow-inner"
                          style={{ backgroundColor: bg.hex, borderColor: bg.border }}
                        />
                        <span>{bg.name}</span>
                      </div>
                      {selectedBackground === bg.name && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Hashtag Serial Dropdown */}
            <div className="relative z-50">
              <label className="block text-[8px] sm:text-[9px] font-bold uppercase text-[#8E8E93] mb-0.5 truncate flex items-center gap-0.5">
                <span className="text-amber-400 font-mono font-black shrink-0">#</span>
                <span className="truncate">Hashtag</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'HASHTAG' ? 'NONE' : 'HASHTAG')}
                className={cn(
                  'w-full bg-[#222225] border rounded-xl px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-bold flex items-center justify-between text-left transition-all',
                  selectedHashtag !== 'ALL'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-[#2C2C2E] text-[#F5F5F7] hover:border-[#3A3A3C]'
                )}
              >
                <span className="truncate font-mono">{selectedHashtag === 'ALL' ? 'All Serials' : `#${selectedHashtag}`}</span>
                <ChevronDown className="w-3 h-3 shrink-0 ml-0.5 text-[#8E8E93]" />
              </button>

              {activeDropdown === 'HASHTAG' && (
                <div className="absolute top-full right-0 mt-1 w-36 sm:w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1.5 z-50 space-y-1 max-h-56 overflow-y-auto scrollbar-hide animate-fadeIn">
                  <button
                    onClick={() => {
                      setSelectedHashtag('ALL');
                      setActiveDropdown('NONE');
                    }}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between',
                      selectedHashtag === 'ALL'
                        ? 'bg-[#0088CC] text-white'
                        : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                    )}
                  >
                    <span>All Serials</span>
                    {selectedHashtag === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {POPULAR_HASHTAGS.map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setSelectedHashtag(num);
                        setActiveDropdown('NONE');
                      }}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-between',
                        selectedHashtag === num
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-[#A1A1AA] hover:bg-[#2A2A2E] hover:text-white'
                      )}
                    >
                      <span>#{num}</span>
                      {selectedHashtag === num && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Listings / Sales Results */}
      {filteredListings.length === 0 ? (
        <div className="bg-[#1C1C1E] rounded-2xl p-8 border border-[#2C2C2E] text-center space-y-2">
          <p className="text-sm font-bold text-[#F5F5F7]">No gifts found matching your filters</p>
          <p className="text-xs text-[#8E8E93]">Try resetting or tweaking your filter selections</p>
          <button
            onClick={clearFilters}
            className="mt-3 bg-[#0088CC] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0099EE] transition-colors inline-block"
          >
            Clear All Filters
          </button>
        </div>
      ) : tab === 'SOLD' ? (
        /* Professional Sold Deals Table View */
        <div className="space-y-2.5">
          {/* Table Header Bar */}
          <div className="hidden">
            <div className="col-span-5 flex items-center gap-1.5">
              <span>Gift Item</span>
            </div>
            <div className="col-span-4 flex items-center justify-center gap-1">
              <span>Trader Flow (Seller ➔ Buyer)</span>
            </div>
            <div className="col-span-3 text-right">
              <span>Sale Price & Timing</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {visibleListings.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectGift(item as Gift)}
                className="bg-[#18181A] hover:bg-[#202024] border border-[#2C2C2E] hover:border-purple-500/40 rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* 1. Small Gift Icon & Name & Traits */}
                  <div className="flex items-center gap-3 min-w-0 sm:w-5/12">
                    <div className="relative w-12 h-12 rounded-xl bg-[#141416] border border-[#3A3A3C] shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-inner">
                      <img
                        src={item.background}
                        alt="bg"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <img
                        src={item.modelUrl}
                        alt={item.name}
                        className={cn(
                          "relative z-10 w-10 h-10 object-contain drop-shadow group-hover:scale-105 transition-transform",
                          (item.name === 'Champion Bear' || item.id === 'gift-3') && "scale-[1.45]"
                        )}
                      />
                      <span className="absolute top-0.5 right-0.5 text-[8px] font-black bg-black/80 text-amber-400 px-1 rounded font-mono z-20">
                        #{item.serialNumber}
                      </span>
                    </div>

                    {/* Gift Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-[#F5F5F7] truncate">{item.name}</h4>
                        <span className="text-xs font-mono font-bold text-amber-400">#{item.serialNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[9px] text-[#8E8E93] bg-[#222225] px-1.5 py-0.5 rounded border border-[#2C2C2E]">
                          {item.modelName}
                        </span>
                        <span className="text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                          {item.backgroundName} ({item.backgroundRarity})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Seller & Buyer Flow */}
                  <div className="flex items-center justify-between sm:justify-center gap-2 bg-[#141416] px-3 py-1.5 rounded-xl border border-[#2C2C2E] shrink-0 sm:w-4/12">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] uppercase font-bold text-[#8E8E93]">Seller</span>
                      <span className="text-xs font-bold text-[#F5F5F7] truncate">@{(item as any).seller}</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mx-1.5" />

                    <div className="flex flex-col min-w-0 text-right sm:text-left">
                      <span className="text-[8px] uppercase font-bold text-[#8E8E93]">Buyer</span>
                      <span className="text-xs font-bold text-green-400 truncate">@{(item as any).buyer}</span>
                    </div>
                  </div>

                  {/* 3. Sale Price & Timing */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2C2C2E] shrink-0 sm:w-3/12">
                    <div className="text-left sm:text-right">
                      <span className="text-[8px] uppercase font-bold text-[#8E8E93] block">Sale Price</span>
                      <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-[#F5F5F7]">
                        <DynamicNumber value={item.priceGram} imageClassName="h-3.5" />
                        <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1 shrink-0 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        <span>{(item as any).soldAt || 'Sold'}</span>
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-[#222225] group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center text-[#8E8E93]">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Listings Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {visibleListings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectGift(item as Gift)}
              className="bg-[#1C1C1E] rounded-2xl p-3 border border-[#2C2C2E] hover:border-[#0088CC]/50 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
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
                    className={cn(
                      "relative z-10 w-20 h-20 object-contain drop-shadow-xl group-hover:scale-105 transition-transform",
                      (item.name === 'Champion Bear' || item.id === 'gift-3') && "scale-[1.45]"
                    )}
                  />

                  {/* Serial Hashtag Badge */}
                  <span className="absolute top-1.5 right-1.5 z-20 text-[9px] font-black bg-black/60 backdrop-blur-md text-amber-400 px-1.5 py-0.5 rounded-md border border-white/10 font-mono">
                    #{item.serialNumber}
                  </span>

                  {/* Seller Tag */}
                  <span className="absolute bottom-1.5 left-1.5 z-20 text-[8px] font-bold bg-black/60 backdrop-blur-md text-[#8E8E93] px-1.5 py-0.5 rounded">
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
                <div className="w-7 h-7 rounded-lg bg-[#0088CC] text-white group-hover:bg-[#0099EE] flex items-center justify-center shadow-md transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination / Load More Button for 300+ items */}
      {visibleListings.length < filteredListings.length && (
        <div className="text-center pt-3 pb-2">
          <button
            onClick={() => setDisplayLimit(prev => prev + 28)}
            className="bg-[#222225] hover:bg-[#2A2A2E] text-[#F5F5F7] border border-[#3A3A3C] hover:border-[#0088CC] text-xs font-bold px-6 py-2.5 rounded-2xl shadow-md transition-all inline-flex items-center gap-2 group"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0088CC] group-hover:rotate-180 transition-transform duration-500" />
            <span>Load More Gifts ({filteredListings.length - visibleListings.length} Remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
}
