import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// In-memory data store
let gifts = [
  { id: 'gift-1', name: 'Tele GT', image: 'https://i.suar.me/ogamY/l', priceGram: 25, totalSupply: 1000, remainingSupply: 742, status: 'AVAILABLE', createdAt: new Date().toISOString() }
];

let orders: any[] = [];

async function initDB() {
  // DB initialization is now empty as we use in-memory arrays
}

// Receiver address from config
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS || 'UQCTZAMbXoN5T43K9gJXH8GYWBmIstXrUrdoV9kv3btN1Ad3';

// Mock TON Connect Manifest
app.get("/tonconnect-manifest.json", (req, res) => {
  res.json({
    url: process.env.APP_URL || "https://telegram-mini-app.com",
    name: "Digital Gifts Store",
    iconUrl: "https://i.suar.me/zXrj0/l"
  });
});

app.get("/api/gifts", async (req, res) => {
  try {
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gifts" });
  }
});

app.get("/api/gifts/:id", async (req, res) => {
  try {
    const gift = gifts.find(g => g.id === req.params.id);
    if (!gift) return res.status(404).json({ error: "Gift not found" });
    res.json(gift);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gift" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { userId, giftId, background } = req.body;
    const gift = gifts.find(g => g.id === giftId);
    
    if (!gift) return res.status(404).json({ error: "Gift not found" });
    if (gift.remainingSupply <= 0) return res.status(400).json({ error: "Sold out" });

    const orderId = crypto.randomUUID();
    
    orders.push({
      id: orderId,
      userId: userId || 'anonymous',
      giftId: giftId,
      amountGram: gift.priceGram,
      receiverAddress: RECEIVER_ADDRESS,
      background: background || 'https://i.suar.me/Lpozo/l', // default to black
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    res.json({ 
      orderId, 
      receiverAddress: RECEIVER_ADDRESS,
      amountGram: gift.priceGram 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/verify", async (req, res) => {
  try {
    const { orderId, transactionHash } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found" });
    
    const order = orders[orderIndex];
    if (order.status === 'PAID') return res.status(400).json({ error: "Order already paid" });

    const giftIndex = gifts.findIndex(g => g.id === order.giftId);
    const gift = gifts[giftIndex];
    if (gift.remainingSupply <= 0) {
       return res.status(400).json({ error: "Gift sold out before payment completion" });
    }

    // Update order status
    orders[orderIndex] = { ...order, status: 'PAID', transactionHash };
    
    // Decrement supply
    const newSupply = gift.remainingSupply - 1;
    gifts[giftIndex] = {
      ...gift,
      remainingSupply: newSupply,
      status: newSupply === 0 ? 'SOLD_OUT' : gift.status
    };

    res.json({ success: true, orderId });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify transaction" });
  }
});

app.get("/api/my-gifts", async (req, res) => {
  try {
    const { userId } = req.query;
    const userOrders = orders.filter(o => o.userId === (userId || 'anonymous') && o.status === 'PAID');
    
    const myGifts = userOrders.map(order => {
      const gift = gifts.find(g => g.id === order.giftId);
      return {
        ...gift,
        orderId: order.id,
        background: order.background,
        purchaseDate: order.createdAt
      };
    }).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    
    res.json(myGifts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user gifts" });
  }
});

async function startServer() {
  await initDB();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
