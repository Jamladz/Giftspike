import { db, auth } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, runTransaction, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { Gift } from '../types';

const INITIAL_GIFTS: Gift[] = [
  { 
    id: 'gift-1', 
    name: 'Tele GT', 
    image: 'https://i.suar.me/ogamY/l', 
    priceGram: 9, 
    totalSupply: 1000, 
    remainingSupply: 742, 
    status: 'AVAILABLE', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'gift-2', 
    name: 'Cash Cannon', 
    image: 'https://i.suar.me/6z9Ka/l', 
    priceGram: 4.5, 
    totalSupply: 2000, 
    remainingSupply: 1450, 
    status: 'AVAILABLE', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'gift-3', 
    name: 'Champion Bear', 
    image: 'https://i.suar.me/Npgv0/l', 
    priceGram: 0.5, 
    totalSupply: 300000, 
    remainingSupply: 0, 
    status: 'SOLD_OUT', 
    createdAt: new Date().toISOString() 
  }
];

const BACKGROUND_TRAITS = [
  { name: 'Gold', url: 'https://i.suar.me/V9BKK/l', rarity: '2%', weight: 2 },
  { name: 'Black', url: 'https://i.suar.me/Lpozo/l', rarity: '5%', weight: 5 },
  { name: 'Red', url: 'https://i.suar.me/MpVKv/l', rarity: '8%', weight: 8 },
  { name: 'Burgundy', url: 'https://i.suar.me/2zOW9/l', rarity: '15%', weight: 15 },
  { name: 'Green', url: 'https://i.suar.me/8zo1y/l', rarity: '15%', weight: 15 },
  { name: 'Purple', url: 'https://i.suar.me/9zJo7/l', rarity: '15%', weight: 15 },
  { name: 'Cyan', url: 'https://i.suar.me/YQBX9/l', rarity: '15%', weight: 15 },
  { name: 'Orange', url: 'https://i.suar.me/g46m5/l', rarity: '25%', weight: 25 },
];

const TELE_GT_MODELS = [
  { name: 'Golden Luxury', url: 'https://i.suar.me/ZzXKJ/l', rarity: '5%', weight: 5 },
  { name: 'Stealth Black', url: 'https://i.suar.me/0poq0/l', rarity: '15%', weight: 15 },
  { name: 'Cyber Green', url: 'https://i.suar.me/ApeYO/l', rarity: '20%', weight: 20 },
  { name: 'Neon Pink', url: 'https://i.suar.me/Gn3GN/l', rarity: '25%', weight: 25 },
  { name: 'Classic Blue', url: 'https://i.suar.me/ogamY/l', rarity: '35%', weight: 35 },
];

const CASH_CANNON_MODELS = [
  { name: 'Diamond Cannon', url: 'https://i.suar.me/WPBxr/l', rarity: '5%', weight: 5 },
  { name: 'Cyber Blaster', url: 'https://i.suar.me/PpMOQ/l', rarity: '15%', weight: 15 },
  { name: 'Ruby Launcher', url: 'https://i.suar.me/EpjKx/l', rarity: '20%', weight: 20 },
  { name: 'Neon Cash', url: 'https://i.suar.me/vAdEW/l', rarity: '25%', weight: 25 },
  { name: 'Gold Standard', url: 'https://i.suar.me/6z9Ka/l', rarity: '35%', weight: 35 },
];

const CHAMPION_BEAR_MODELS = [
  { name: 'Spain', url: 'https://i.suar.me/lZBEl/l', rarity: '20%', weight: 20 },
  { name: 'Brazil', url: 'https://i.suar.me/Op9jM/l', rarity: '20%', weight: 20 },
  { name: 'Argentina', url: 'https://i.suar.me/Npgv0/l', rarity: '20%', weight: 20 },
  { name: 'England', url: 'https://i.suar.me/e9BpG/l', rarity: '20%', weight: 20 },
  { name: 'Norway', url: 'https://i.suar.me/qvlEx/l', rarity: '20%', weight: 20 },
];

function pickRandomTrait<T extends { weight: number }>(traits: T[]): T {
  const totalWeight = traits.reduce((sum, trait) => sum + trait.weight, 0);
  let random = Math.random() * totalWeight;
  for (const trait of traits) {
    if (random < trait.weight) return trait;
    random -= trait.weight;
  }
  return traits[0];
}

const ensureAuth = async () => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
};

export const api = {
  getGifts: async (): Promise<Gift[]> => {
    try {
      await ensureAuth();
      const giftsSnap = await getDocs(collection(db, 'gifts'));
      if (giftsSnap.empty) {
        // Seed initial gifts
        const batch: Promise<void>[] = [];
        INITIAL_GIFTS.forEach(g => {
          batch.push(setDoc(doc(db, 'gifts', g.id), g));
        });
        await Promise.all(batch);
        return INITIAL_GIFTS;
      }
      return giftsSnap.docs.map(d => d.data() as Gift);
    } catch (error) {
      console.error("Firebase getGifts error", error);
      return INITIAL_GIFTS; // fallback if failing
    }
  },

  createOrder: async (userId: string, giftOrId: string | Gift, _background?: string) => {
    await ensureAuth();
    
    let gift: any = typeof giftOrId === 'string' ? undefined : giftOrId;
    const giftId = typeof giftOrId === 'string' ? giftOrId : giftOrId.id;

    if (!gift) {
      const gifts = await api.getGifts();
      gift = gifts.find(g => g.id === giftId);
      
      // Support market gifts which are not in the main gifts array
      if (!gift && giftId.startsWith('mrkt-')) {
        gift = {
          id: giftId,
          name: giftId.includes('2') ? 'Cash Cannon' : 'Tele GT',
          priceGram: 25,
          remainingSupply: 1,
          totalSupply: 1000,
          status: 'AVAILABLE'
        } as any;
      }
    }
    
    if (!gift) throw new Error('Gift not found');
    if (gift.remainingSupply <= 0) throw new Error('Sold out');

    // If it's a market gift with a preset background/model, use it directly
    const isMrkt = gift.isMrktListing || giftId.startsWith('mrkt-');
    
    let selectedBg;
    let selectedModel;
    let serialNumber;

    if (isMrkt && gift.modelUrl && gift.background) {
       selectedBg = {
         url: gift.background,
         name: gift.backgroundName || 'Custom',
         rarity: gift.backgroundRarity || 'Unknown',
       };
       selectedModel = {
         url: gift.modelUrl,
         name: gift.modelName || 'Custom',
         rarity: gift.modelRarity || 'Unknown',
       };
       serialNumber = gift.serialNumber || Math.floor(Math.random() * 999);
    } else {
      selectedBg = pickRandomTrait(BACKGROUND_TRAITS);
      let modelTraits = TELE_GT_MODELS;
      if (gift.id === 'gift-2' || gift.name === 'Cash Cannon') {
        modelTraits = CASH_CANNON_MODELS;
      } else if (gift.id === 'gift-3' || gift.name === 'Champion Bear') {
        modelTraits = CHAMPION_BEAR_MODELS;
      }
      selectedModel = pickRandomTrait(modelTraits);
      serialNumber = (gift.totalSupply - gift.remainingSupply) + 1;
    }

    const orderId = crypto.randomUUID();
    const newOrder = {
      id: orderId,
      userId: userId || 'anonymous',
      giftId,
      amountGram: gift.priceGram,
      receiverAddress: 'UQCTZAMbXoN5T43K9gJXH8GYWBmIstXrUrdoV9kv3btN1Ad3', // Mock Address
      background: selectedBg.url,
      backgroundName: selectedBg.name,
      backgroundRarity: selectedBg.rarity,
      modelUrl: selectedModel.url,
      modelName: selectedModel.name,
      modelRarity: selectedModel.rarity,
      serialNumber,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'orders', orderId), newOrder);

    return {
      orderId,
      receiverAddress: newOrder.receiverAddress,
      amountGram: gift.priceGram,
      background: selectedBg.url,
      backgroundName: selectedBg.name,
      backgroundRarity: selectedBg.rarity,
      modelUrl: selectedModel.url,
      modelName: selectedModel.name,
      modelRarity: selectedModel.rarity,
      serialNumber
    };
  },

  verifyOrder: async (orderId: string, transactionHash: string) => {
    await ensureAuth();
    
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Order not found');
      
      const order = orderSnap.data();
      if (order.status === 'PAID') throw new Error('Order already paid');

      const giftRef = doc(db, 'gifts', order.giftId);
      const giftSnap = await transaction.get(giftRef);
      
      if (giftSnap.exists()) {
        const gift = giftSnap.data();
        if (gift.remainingSupply <= 0) {
          throw new Error('Gift sold out before payment completion');
        }
        const newSupply = gift.remainingSupply - 1;
        transaction.update(giftRef, {
          remainingSupply: newSupply,
          status: newSupply === 0 ? 'SOLD_OUT' : gift.status
        });
      }

      transaction.update(orderRef, {
        status: 'PAID',
        transactionHash
      });

      return { success: true, orderId };
    });
  },

  getMyGifts: async (userId: string) => {
    try {
      await ensureAuth();
      const gifts = await api.getGifts();
      
      const q = query(collection(db, 'orders'), where('userId', '==', userId || 'anonymous'));
      const querySnapshot = await getDocs(q);
      
      const userOrders = querySnapshot.docs
        .map(d => d.data())
        .filter(o => o.status === 'PAID' || o.status === 'LISTED_ON_MRKT');

      const myGifts = userOrders.map((order: any, idx: number) => {
        const gift = gifts.find((g: any) => g.id === order.giftId);
        let modelTraits = TELE_GT_MODELS;
        if (order.giftId === 'gift-2' || (gift && gift.name === 'Cash Cannon')) {
          modelTraits = CASH_CANNON_MODELS;
        } else if (order.giftId === 'gift-3' || (gift && gift.name === 'Champion Bear')) {
          modelTraits = CHAMPION_BEAR_MODELS;
        }

        const defaultBg = BACKGROUND_TRAITS[idx % BACKGROUND_TRAITS.length];
        const defaultModel = modelTraits[idx % modelTraits.length];
        const serialNumber = order.serialNumber || (gift ? gift.totalSupply - gift.remainingSupply - idx : 258);

        return {
          ...gift,
          orderId: order.id,
          orderStatus: order.status,
          serialNumber,
          background: order.background || defaultBg.url,
          backgroundName: order.backgroundName || defaultBg.name,
          backgroundRarity: order.backgroundRarity || defaultBg.rarity,
          modelUrl: order.modelUrl || defaultModel.url,
          modelName: order.modelName || defaultModel.name,
          modelRarity: order.modelRarity || defaultModel.rarity,
          purchaseDate: order.createdAt
        };
      }).sort((a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

      return myGifts;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  listOnMarket: async (orderId: string, listingData: any) => {
    await ensureAuth();
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Order not found');

      // Update order status
      transaction.update(orderRef, { status: 'LISTED_ON_MRKT' });

      // Create market listing
      const listingRef = doc(db, 'market_listings', listingData.id);
      transaction.set(listingRef, {
        ...listingData,
        createdAt: serverTimestamp()
      });

      return { success: true };
    });
  },

  cancelSale: async (orderId: string, listingId: string) => {
    await ensureAuth();
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists()) throw new Error('Order not found');

      transaction.update(orderRef, { status: 'PAID' });
      
      const listingRef = doc(db, 'market_listings', listingId);
      transaction.delete(listingRef);

      return { success: true };
    });
  },

  getMarketListings: async () => {
    try {
      const q = query(collection(db, 'market_listings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
