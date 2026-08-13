import { Gift } from '../types';

const INITIAL_GIFTS: Gift[] = [
  { 
    id: 'gift-1', 
    name: 'Tele GT', 
    image: 'https://i.suar.me/ogamY/l', 
    priceGram: 25, 
    totalSupply: 1000, 
    remainingSupply: 742, 
    status: 'AVAILABLE', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'gift-2', 
    name: 'Cash Cannon', 
    image: 'https://i.suar.me/6z9Ka/l', 
    priceGram: 50, 
    totalSupply: 500, 
    remainingSupply: 312, 
    status: 'AVAILABLE', 
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

function pickRandomTrait<T extends { weight: number }>(traits: T[]): T {
  const totalWeight = traits.reduce((sum, trait) => sum + trait.weight, 0);
  let random = Math.random() * totalWeight;
  for (const trait of traits) {
    if (random < trait.weight) return trait;
    random -= trait.weight;
  }
  return traits[0];
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getGifts: async (): Promise<Gift[]> => {
    await delay(300);
    const storedGifts = localStorage.getItem('tg_gifts');
    if (storedGifts) {
      const parsedGifts: Gift[] = JSON.parse(storedGifts);
      const giftIds = new Set(parsedGifts.map((g: any) => g.id));
      let updated = false;

      const formattedGifts = parsedGifts.map((g: any) => {
        if (g.id === 'gift-1' && g.name !== 'Tele GT') {
          updated = true;
          return { ...g, name: 'Tele GT' };
        }
        return g;
      });

      INITIAL_GIFTS.forEach(ig => {
        if (!giftIds.has(ig.id)) {
          formattedGifts.push(ig);
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem('tg_gifts', JSON.stringify(formattedGifts));
      }
      return formattedGifts;
    }
    localStorage.setItem('tg_gifts', JSON.stringify(INITIAL_GIFTS));
    return INITIAL_GIFTS;
  },

  createOrder: async (userId: string, giftId: string, _background?: string) => {
    await delay(400);
    const gifts = await api.getGifts();
    let gift = gifts.find(g => g.id === giftId);
    
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
    
    if (!gift) throw new Error('Gift not found');
    if (gift.remainingSupply <= 0) throw new Error('Sold out');

    const selectedBg = pickRandomTrait(BACKGROUND_TRAITS);
    const isCannon = gift.id === 'gift-2' || gift.name === 'Cash Cannon';
    const modelTraits = isCannon ? CASH_CANNON_MODELS : TELE_GT_MODELS;
    const selectedModel = pickRandomTrait(modelTraits);
    const serialNumber = (gift.totalSupply - gift.remainingSupply) + 1;

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

    const storedOrders = JSON.parse(localStorage.getItem('tg_orders') || '[]');
    localStorage.setItem('tg_orders', JSON.stringify([...storedOrders, newOrder]));

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
    await delay(800);
    const orders = JSON.parse(localStorage.getItem('tg_orders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');

    const order = orders[orderIndex];
    if (order.status === 'PAID') throw new Error('Order already paid');

    const gifts = await api.getGifts();
    const giftIndex = gifts.findIndex((g: any) => g.id === order.giftId);
    const gift = gifts[giftIndex];

    if (gift && gift.remainingSupply <= 0) {
      throw new Error('Gift sold out before payment completion');
    }

    // Update order status
    orders[orderIndex] = { ...order, status: 'PAID', transactionHash };
    localStorage.setItem('tg_orders', JSON.stringify(orders));

    // Decrement supply only for store gifts
    if (giftIndex !== -1) {
      const newSupply = gift.remainingSupply - 1;
      gifts[giftIndex] = {
        ...gift,
        remainingSupply: newSupply,
        status: newSupply === 0 ? 'SOLD_OUT' : gift.status
      };
      localStorage.setItem('tg_gifts', JSON.stringify(gifts));
    }

    return { success: true, orderId };
  },

  getMyGifts: async (userId: string) => {
    await delay(300);
    const orders = JSON.parse(localStorage.getItem('tg_orders') || '[]');
    const userOrders = orders.filter((o: any) => o.userId === (userId || 'anonymous') && (o.status === 'PAID' || o.status === 'LISTED_ON_MRKT'));
    
    const gifts = await api.getGifts();
    
    const myGifts = userOrders.map((order: any, idx: number) => {
      const gift = gifts.find((g: any) => g.id === order.giftId);
      const isCannon = (gift && gift.name === 'Cash Cannon') || order.giftId === 'gift-2';
      const modelTraits = isCannon ? CASH_CANNON_MODELS : TELE_GT_MODELS;

      // Fallback values for legacy test orders
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
  }
};

