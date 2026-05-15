import { supabase } from './supabase';
import { findStock } from '@/data/stocks';
import type { Gift, GiftUnit } from '@/types';

const TABLE = 'gifts';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

function clean(s: string, max: number) {
  return s.trim().slice(0, max);
}

export type CreateGiftInput = {
  senderName: string;
  stockSymbol: string;
  unit: GiftUnit;
  quantity: number; // shares count or rupee amount, depending on unit
  pricePerShare?: number; // live price from API; falls back to catalog stale value
  note?: string;
};

export async function createGift(input: CreateGiftInput): Promise<{ id: string } | { error: string }> {
  const senderName = clean(input.senderName, 40);
  const note = input.note ? clean(input.note, 200) : null;

  if (senderName.length < 1) return { error: 'Please enter your name.' };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { error: 'Enter a valid quantity.' };
  }
  if (input.unit !== 'shares' && input.unit !== 'rupees') {
    return { error: GENERIC_ERROR };
  }

  const stock = findStock(input.stockSymbol);
  if (!stock) return { error: GENERIC_ERROR };

  const price =
    input.pricePerShare != null && Number.isFinite(input.pricePerShare) && input.pricePerShare > 0
      ? input.pricePerShare
      : stock.pricePerShare;

  const totalValue =
    input.unit === 'shares'
      ? Math.round(input.quantity * price * 100) / 100
      : input.quantity;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      sender_name: senderName,
      stock_symbol: stock.symbol,
      stock_name: stock.name,
      unit: input.unit,
      quantity: input.quantity,
      price_per_share: price,
      total_value: totalValue,
      note,
    })
    .select('id')
    .single();

  if (error || !data) return { error: GENERIC_ERROR };
  return { id: data.id as string };
}

export async function getGift(id: string): Promise<Gift | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Gift;
}

export async function claimGift(
  id: string,
  receiverName: string,
): Promise<{ ok: true; gift: Gift } | { error: string }> {
  const name = clean(receiverName, 40);
  if (name.length < 1) return { error: 'Please enter your name to accept.' };

  // Conditional update: only update if status is still 'pending'.
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: 'claimed', receiver_name: name, claimed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();

  if (error) return { error: GENERIC_ERROR };
  if (!data) return { error: 'This gift was already claimed.' };
  return { ok: true, gift: data as Gift };
}

export async function listMyGifts(senderName: string): Promise<Gift[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('sender_name', clean(senderName, 40))
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as Gift[];
}

export async function listMyHoldings(receiverName: string): Promise<Gift[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('receiver_name', clean(receiverName, 40))
    .eq('status', 'claimed')
    .order('claimed_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as Gift[];
}

export function subscribeToGift(id: string, cb: (g: Gift) => void) {
  const channel = supabase
    .channel(`gift:${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: TABLE, filter: `id=eq.${id}` },
      (payload) => cb(payload.new as Gift),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
