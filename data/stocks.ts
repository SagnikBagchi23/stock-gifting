import type { Stock } from '@/types';

// Curated catalog — all have logos in /logos/. HDFCBANK is pinned first; GROWW pinned second.
// pricePerShare is a stale fallback used only when the live fetch fails.
// sharesHeld / investedValue are simulated portfolio data for demo display.
export const STOCKS: Stock[] = [
  // — Pinned top two —
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',                      pricePerShare: 1652.8,  sharesHeld: 150,   investedValue: 120803  },
  { symbol: 'GROWW',      name: 'Groww',                          pricePerShare: 89.5,    sharesHeld: 22350, investedValue: 1505273 },

  // New-age / consumer internet
  { symbol: 'SWIGGY',     name: 'Swiggy',                         pricePerShare: 355.2,   sharesHeld: 450,   investedValue: 175613  },
  { symbol: 'ETERNAL',    name: 'Eternal (Zomato)',               pricePerShare: 240.8,   sharesHeld: 800,   investedValue: 143480  },

  // IT & telecom
  { symbol: 'TCS',        name: 'Tata Consultancy Services',      pricePerShare: 3915.2,  sharesHeld: 50,    investedValue: 164483  },
  { symbol: 'INFY',       name: 'Infosys',                        pricePerShare: 1485.0,  sharesHeld: 100,   investedValue: 131785  },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',                  pricePerShare: 1525.7,  sharesHeld: 120,   investedValue: 101982  },

  // Banking & finance
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',                     pricePerShare: 1124.5,  sharesHeld: 200,   investedValue: 189870  },
  { symbol: 'SBIN',       name: 'State Bank of India',            pricePerShare: 815.6,   sharesHeld: 250,   investedValue: 144963  },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',                  pricePerShare: 8950.0,  sharesHeld: 25,    investedValue: 174719  },
  { symbol: 'YESBANK',    name: 'Yes Bank',                       pricePerShare: 19.8,    sharesHeld: 5000,  investedValue: 81750   },

  // Energy & industrials
  { symbol: 'RELIANCE',   name: 'Reliance Industries',            pricePerShare: 2890.45, sharesHeld: 80,    investedValue: 193908  },
  { symbol: 'NTPC',       name: 'NTPC',                           pricePerShare: 355.5,   sharesHeld: 500,   investedValue: 86925   },
  { symbol: 'LT',         name: 'Larsen & Toubro',                pricePerShare: 3480.0,  sharesHeld: 40,    investedValue: 88234   },

  // Consumer & auto
  { symbol: 'ITC',        name: 'ITC Limited',                    pricePerShare: 432.1,   sharesHeld: 500,   investedValue: 222925  },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',             pricePerShare: 2410.0,  sharesHeld: 60,    investedValue: 160071  },
  { symbol: 'NESTLEIND',  name: 'Nestlé India',                   pricePerShare: 2280.0,  sharesHeld: 60,    investedValue: 143211  },
  { symbol: 'TITAN',      name: 'Titan Company',                  pricePerShare: 3285.0,  sharesHeld: 45,    investedValue: 127028  },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',                   pricePerShare: 2350.0,  sharesHeld: 55,    investedValue: 175607  },

  // Pharma
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',             pricePerShare: 1785.0,  sharesHeld: 80,    investedValue: 77988   },

  // Metals
  { symbol: 'TATASTEEL',  name: 'Tata Steel',                     pricePerShare: 156.8,   sharesHeld: 1200,  investedValue: 127020  },

  // Real estate
  { symbol: 'DLF',        name: 'DLF Limited',                    pricePerShare: 810.0,   sharesHeld: 200,   investedValue: 94970   },
];

export function findStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
