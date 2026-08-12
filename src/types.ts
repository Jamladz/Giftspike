export interface Gift {
  id: string;
  name: string;
  image: string;
  priceGram: number;
  totalSupply: number;
  remainingSupply: number;
  status: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';
  createdAt: string;

  // Fixed traits for purchased or MRKT gifts
  serialNumber?: number;
  background?: string;
  backgroundName?: string;
  backgroundRarity?: string;
  modelUrl?: string;
  modelName?: string;
  modelRarity?: string;
  seller?: string;
  orderId?: string;
  isMrktListing?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  giftId: string;
  amountGram: number;
  receiverAddress: string;
  background: string;
  backgroundName?: string;
  backgroundRarity?: string;
  modelUrl?: string;
  modelName?: string;
  modelRarity?: string;
  serialNumber?: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  transactionHash?: string;
  createdAt: string;
}

export type PaymentState = 'INITIAL' | 'CONNECTING' | 'CONFIRMING' | 'PROCESSING' | 'VERIFYING' | 'SUCCESS' | 'ERROR' | 'SOLD_OUT';
