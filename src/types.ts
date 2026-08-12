export interface Gift {
  id: string;
  name: string;
  image: string;
  priceGram: number;
  totalSupply: number;
  remainingSupply: number;
  status: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  giftId: string;
  amountGram: number;
  receiverAddress: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  transactionHash?: string;
  createdAt: string;
}

export type PaymentState = 'INITIAL' | 'CONNECTING' | 'CONFIRMING' | 'PROCESSING' | 'VERIFYING' | 'SUCCESS' | 'ERROR' | 'SOLD_OUT';
