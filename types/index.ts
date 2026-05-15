export type Stock = {
  symbol: string;
  name: string;
  pricePerShare: number; // mock price in INR
};

export type GiftStatus = 'pending' | 'claimed';
export type GiftUnit = 'shares' | 'rupees';

export type Gift = {
  id: string;
  sender_name: string;
  receiver_name: string | null;
  stock_symbol: string;
  stock_name: string;
  unit: GiftUnit;
  quantity: number;
  price_per_share: number;
  total_value: number;
  note: string | null;
  status: GiftStatus;
  created_at: string;
  claimed_at: string | null;
};
