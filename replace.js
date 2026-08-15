const fs = require('fs');
let code = fs.readFileSync('src/components/MarketView.tsx', 'utf8');

const regex = /\/\/ Realistic Bot Trading Engine Interval .*?return \(\) => clearInterval\(timer\);\n  }, \[activeMarketListings\]);/s;

if (!regex.test(code)) {
    console.log("Could not match the regex");
    process.exit(1);
}

const replacement = `// Realistic Bot Engine (Simulated Catch-up & Dynamic Intervals)
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
        let missedTrades = Math.floor(diffSecs / 6); // roughly 1 trade every 6s average
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
               const simulatedTimestamp = now - (missedTrades - i) * 6000;

               if (rand < 0.55 && activeCount > 5) {
                  const randomIndex = Math.floor(Math.random() * activeCount);
                  const itemToBuy = currentActive[randomIndex];
                  if (!ALL_TELEGRAM_BOTS.includes(itemToBuy.seller)) continue; // Bots don't buy from real users in offline catch-up
                  
                  let buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
                  while (buyer === itemToBuy.seller) {
                    buyer = ALL_TELEGRAM_BOTS[Math.floor(Math.random() * ALL_TELEGRAM_BOTS.length)];
                  }
                  
                  const soldItem = {
                    ...itemToBuy,
                    id: \`sold-sim-\${simulatedTimestamp}-\${Math.random().toString(36).substr(2, 4)}\`,
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
                    id: \`mrkt-flip-\${simulatedTimestamp}-\${Math.random().toString(36).substr(2, 4)}\`,
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
                    id: \`mrkt-live-\${simulatedTimestamp}-\${Math.random().toString(36).substr(2, 4)}\`,
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
              id: \`sold-live-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
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
              text: \`⚡ @\${itemToBuy.seller} ➔ @\${buyer} bought \${itemToBuy.name} #\${itemToBuy.serialNumber} for \${itemToBuy.priceGram} GRAM\`,
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
            id: \`mrkt-flip-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
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
            text: \`🏷️ @\${seller} relisted \${flippedItem.name} #\${flippedItem.serialNumber} (\${flippedItem.modelName}) for \${newPriceGram} GRAM (+\${Math.round(markupPercent * 100)}%)\`,
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
            id: \`mrkt-live-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,
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
            text: \`🏷️ @\${seller} listed \${giftName} #\${serialNumber} (\${randomModel.name}) for \${priceGram} GRAM\`,
            id: Date.now(),
          });
        }
      }

      // Carefully studied dynamic pacing 
      // Mood determines the gap until the NEXT trade
      let nextDelay;
      const mood = Math.random();
      if (mood < 0.25) {
        // FOMO Burst Mode: 500ms to 2.5s
        nextDelay = Math.floor(Math.random() * 2000) + 500;
      } else if (mood < 0.8) {
        // Normal Activity: 3s to 7s
        nextDelay = Math.floor(Math.random() * 4000) + 3000;
      } else {
        // Slow Market Lull: 8s to 15s
        nextDelay = Math.floor(Math.random() * 7000) + 8000;
      }
      
      timeoutId = setTimeout(runEngine, nextDelay);
    };

    // Start engine with initial delay
    timeoutId = setTimeout(runEngine, Math.floor(Math.random() * 3000) + 1000);

    return () => clearTimeout(timeoutId);
  }, []);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/MarketView.tsx', code);
console.log("Replaced successfully!");
