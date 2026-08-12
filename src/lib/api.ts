import { Gift } from '../types';

const INITIAL_GIFTS: Gift[] = [
  { id: 'gift-1', name: 'Tele GT', image: 'https://i.suar.me/ogamY/l', priceGram: 25, totalSupply: 1000, remainingSupply: 742, status: 'AVAILABLE' }
];

const BACKGROUNDS = [
  'https://i.suar.me/2zOW9/l', // Burgundy
  'https://i.suar.me/Lpozo/l', // Black
  'https://i.suar.me/8zo1y/l', // Green
  'https://i.suar.me/jv05v/l', // Brown
  'https://i.suar.me/g46m5/l', // Orange
  'https://i.suar.me/9zJo7/l', // Purple
  'https://i.suar.me/V9BKK/l', // Gold
  'https://i.suar.me/YQBX9/l', // Cyan
  'https://i.suar.me/MpVKv/l', // Red
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getGifts: async (): Promise<Gift[]> => {
    await delay(300);
    const storedGifts = localStorage.getItem('tg_gifts');
    if (storedGifts) {
      const parsedGifts = JSON.parse(storedGifts);
      // Force update the name for existing users
      const updatedGifts = parsedGifts.map((g: any) => 
        g.id === 'gift-1' ? { ...g, name: 'Tele GT' } : g
      );
      localStorage.setItem('tg_gifts', JSON.stringify(updatedGifts));
      return updatedGifts;
    }
    localStorage.setItem('tg_gifts', JSON.stringify(INITIAL_GIFTS));
    return INITIAL_GIFTS;
  },

  createOrder: async (userId: string, giftId: string, background: string) => {
    await delay(400);
    const gifts = await api.getGifts();
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) throw new Error('Gift not found');
    if (gift.remainingSupply <= 0) throw new Error('Sold out');

    const orderId = crypto.randomUUID();
    const newOrder = {
      id: orderId,
      userId: userId || 'anonymous',
      giftId,
      amountGram: gift.priceGram,
      receiverAddress: 'UQCTZAMbXoN5T43K9gJXH8GYWBmIstXrUrdoV9kv3btN1Ad3', // Mock Address
      background: background || BACKGROUNDS[1],
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const storedOrders = JSON.parse(localStorage.getItem('tg_orders') || '[]');
    localStorage.setItem('tg_orders', JSON.stringify([...storedOrders, newOrder]));

    return {
      orderId,
      receiverAddress: newOrder.receiverAddress,
      amountGram: gift.priceGram
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

    if (gift.remainingSupply <= 0) {
      throw new Error('Gift sold out before payment completion');
    }

    // Update order status
    orders[orderIndex] = { ...order, status: 'PAID', transactionHash };
    localStorage.setItem('tg_orders', JSON.stringify(orders));

    // Decrement supply
    const newSupply = gift.remainingSupply - 1;
    gifts[giftIndex] = {
      ...gift,
      remainingSupply: newSupply,
      status: newSupply === 0 ? 'SOLD_OUT' : gift.status
    };
    localStorage.setItem('tg_gifts', JSON.stringify(gifts));

    return { success: true, orderId };
  },

  getMyGifts: async (userId: string) => {
    await delay(300);
    const orders = JSON.parse(localStorage.getItem('tg_orders') || '[]');
    const userOrders = orders.filter((o: any) => o.userId === (userId || 'anonymous') && o.status === 'PAID');
    
    const gifts = await api.getGifts();
    
    const myGifts = userOrders.map((order: any) => {
      const gift = gifts.find((g: any) => g.id === order.giftId);
      return {
        ...gift,
        orderId: order.id,
        background: order.background,
        purchaseDate: order.createdAt
      };
    }).sort((a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return myGifts;
  }
};
