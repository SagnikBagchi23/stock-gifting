import type { Stock } from '@/types';

// Curated catalog — all have logos in /logos/. Swiggy, Groww, Eternal (Zomato) are mandatory.
// pricePerShare is a stale fallback used only when the live fetch fails.
export const STOCKS: Stock[] = [
  // New-age / consumer internet
  { symbol: 'GROWW',      name: 'Groww (Nextbillion Technology)', pricePerShare: 89.5 },
  { symbol: 'SWIGGY',     name: 'Swiggy',                         pricePerShare: 355.2 },
  { symbol: 'ETERNAL',    name: 'Eternal (Zomato)',               pricePerShare: 240.8 },
  { symbol: 'MOBIKWIK',   name: 'MobiKwik',                       pricePerShare: 395.0 },

  // IT & telecom
  { symbol: 'TCS',        name: 'Tata Consultancy Services',      pricePerShare: 3915.2 },
  { symbol: 'INFY',       name: 'Infosys',                        pricePerShare: 1485.0 },
  { symbol: 'WIPRO',      name: 'Wipro',                          pricePerShare: 462.3 },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',               pricePerShare: 1620.0 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',                  pricePerShare: 1525.7 },

  // Banking & finance
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',                      pricePerShare: 1652.8 },
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',                     pricePerShare: 1124.5 },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',            pricePerShare: 2185.0 },
  { symbol: 'AXISBANK',   name: 'Axis Bank',                      pricePerShare: 1142.95 },
  { symbol: 'SBIN',       name: 'State Bank of India',            pricePerShare: 815.6 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',                  pricePerShare: 8950.0 },
  { symbol: 'LICI',       name: 'LIC of India',                   pricePerShare: 895.0 },
  { symbol: 'PNB',        name: 'Punjab National Bank',           pricePerShare: 102.5 },
  { symbol: 'YESBANK',    name: 'Yes Bank',                       pricePerShare: 19.8 },

  // Energy & industrials
  { symbol: 'RELIANCE',   name: 'Reliance Industries',            pricePerShare: 2890.45 },
  { symbol: 'NTPC',       name: 'NTPC',                           pricePerShare: 355.5 },
  { symbol: 'ONGC',       name: 'ONGC',                           pricePerShare: 262.3 },
  { symbol: 'POWERGRID',  name: 'Power Grid Corporation',         pricePerShare: 310.0 },
  { symbol: 'BPCL',       name: 'Bharat Petroleum',               pricePerShare: 292.0 },
  { symbol: 'LT',         name: 'Larsen & Toubro',                pricePerShare: 3480.0 },
  { symbol: 'SIEMENS',    name: 'Siemens India',                  pricePerShare: 6850.0 },

  // Consumer & auto
  { symbol: 'ITC',        name: 'ITC Limited',                    pricePerShare: 432.1 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',             pricePerShare: 2410.0 },
  { symbol: 'NESTLEIND',  name: 'Nestlé India',                   pricePerShare: 2280.0 },
  { symbol: 'TITAN',      name: 'Titan Company',                  pricePerShare: 3285.0 },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',                  pricePerShare: 12450.0 },
  { symbol: 'EICHERMOT',  name: 'Eicher Motors (Royal Enfield)',  pricePerShare: 5120.0 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',                   pricePerShare: 2350.0 },

  // Pharma
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',             pricePerShare: 1785.0 },
  { symbol: 'DRREDDY',    name: "Dr. Reddy's Laboratories",       pricePerShare: 1285.0 },
  { symbol: 'CIPLA',      name: 'Cipla',                          pricePerShare: 1520.0 },
  { symbol: 'LUPIN',      name: 'Lupin',                          pricePerShare: 2140.0 },
  { symbol: 'ZYDUSLIFE',  name: 'Zydus Lifesciences',             pricePerShare: 1025.0 },

  // Metals & cement
  { symbol: 'TATASTEEL',  name: 'Tata Steel',                     pricePerShare: 156.8 },
  { symbol: 'JSWSTEEL',   name: 'JSW Steel',                      pricePerShare: 875.0 },
  { symbol: 'VEDANTA',    name: 'Vedanta',                        pricePerShare: 445.0 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement',               pricePerShare: 11200.0 },

  // Real estate & others
  { symbol: 'DLF',        name: 'DLF Limited',                    pricePerShare: 810.0 },
];

export function findStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
