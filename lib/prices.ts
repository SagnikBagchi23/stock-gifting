// Yahoo Finance v7 quote API — no auth required, NSE stocks use .NS suffix
const BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';

export async function fetchLivePrices(
  nseSymbols: string[],
): Promise<Record<string, number>> {
  const yahooSymbols = nseSymbols.map((s) => `${s}.NS`).join(',');
  try {
    const res = await fetch(
      `${BASE}?symbols=${yahooSymbols}&fields=regularMarketPrice`,
    );
    if (!res.ok) return {};
    const json = await res.json();
    const out: Record<string, number> = {};
    for (const q of json?.quoteResponse?.result ?? []) {
      const sym: string = q.symbol.replace('.NS', '');
      if (typeof q.regularMarketPrice === 'number') {
        out[sym] = q.regularMarketPrice;
      }
    }
    return out;
  } catch {
    return {};
  }
}
