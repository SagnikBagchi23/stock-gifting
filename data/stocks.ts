import type { Stock } from '@/types';

// Curated catalog — all have logos in /logos/. HDFCBANK is pinned first; GROWW pinned second.
// pricePerShare is a stale fallback used only when the live fetch fails.
// sharesHeld / investedValue are simulated portfolio data for demo display.
export const STOCKS: Stock[] = [
  // — Pinned top two —
  { symbol: 'HDFCBANK',   name: 'HDFC Bank',                      pricePerShare: 1652.8,  sharesHeld: 150,   investedValue: 220000  },
  { symbol: 'GROWW',      name: 'Groww',                          pricePerShare: 89.5,    sharesHeld: 22350, investedValue: 1500000 },

  // New-age / consumer internet
  { symbol: 'SWIGGY',     name: 'Swiggy',                         pricePerShare: 355.2,   sharesHeld: 450,   investedValue: 185000  },
  { symbol: 'ETERNAL',    name: 'Eternal (Zomato)',               pricePerShare: 240.8,   sharesHeld: 800,   investedValue: 150000  },
  { symbol: 'MOBIKWIK',   name: 'MobiKwik',                       pricePerShare: 395.0,   sharesHeld: 200,   investedValue: 100000  },

  // IT & telecom
  { symbol: 'TCS',        name: 'Tata Consultancy Services',      pricePerShare: 3915.2,  sharesHeld: 50,    investedValue: 175000  },
  { symbol: 'INFY',       name: 'Infosys',                        pricePerShare: 1485.0,  sharesHeld: 100,   investedValue: 120000  },
  { symbol: 'WIPRO',      name: 'Wipro',                          pricePerShare: 462.3,   sharesHeld: 300,   investedValue: 100000  },
  { symbol: 'HCLTECH',    name: 'HCL Technologies',               pricePerShare: 1620.0,  sharesHeld: 80,    investedValue: 110000  },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel',                  pricePerShare: 1525.7,  sharesHeld: 120,   investedValue: 155000  },

  // Banking & finance
  { symbol: 'ICICIBANK',  name: 'ICICI Bank',                     pricePerShare: 1124.5,  sharesHeld: 200,   investedValue: 180000  },
  { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',            pricePerShare: 2185.0,  sharesHeld: 75,    investedValue: 140000  },
  { symbol: 'AXISBANK',   name: 'Axis Bank',                      pricePerShare: 1142.95, sharesHeld: 180,   investedValue: 175000  },
  { symbol: 'SBIN',       name: 'State Bank of India',            pricePerShare: 815.6,   sharesHeld: 250,   investedValue: 160000  },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',                  pricePerShare: 8950.0,  sharesHeld: 25,    investedValue: 180000  },
  { symbol: 'LICI',       name: 'LIC of India',                   pricePerShare: 895.0,   sharesHeld: 220,   investedValue: 170000  },
  { symbol: 'PNB',        name: 'Punjab National Bank',           pricePerShare: 102.5,   sharesHeld: 1500,  investedValue: 120000  },
  { symbol: 'YESBANK',    name: 'Yes Bank',                       pricePerShare: 19.8,    sharesHeld: 5000,  investedValue: 80000   },

  // Energy & industrials
  { symbol: 'RELIANCE',   name: 'Reliance Industries',            pricePerShare: 2890.45, sharesHeld: 80,    investedValue: 200000  },
  { symbol: 'NTPC',       name: 'NTPC',                           pricePerShare: 355.5,   sharesHeld: 500,   investedValue: 140000  },
  { symbol: 'ONGC',       name: 'ONGC',                           pricePerShare: 262.3,   sharesHeld: 600,   investedValue: 120000  },
  { symbol: 'POWERGRID',  name: 'Power Grid Corporation',         pricePerShare: 310.0,   sharesHeld: 500,   investedValue: 130000  },
  { symbol: 'BPCL',       name: 'Bharat Petroleum',               pricePerShare: 292.0,   sharesHeld: 450,   investedValue: 110000  },
  { symbol: 'LT',         name: 'Larsen & Toubro',                pricePerShare: 3480.0,  sharesHeld: 40,    investedValue: 110000  },
  { symbol: 'SIEMENS',    name: 'Siemens India',                  pricePerShare: 6850.0,  sharesHeld: 20,    investedValue: 115000  },

  // Consumer & auto
  { symbol: 'ITC',        name: 'ITC Limited',                    pricePerShare: 432.1,   sharesHeld: 500,   investedValue: 180000  },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever',             pricePerShare: 2410.0,  sharesHeld: 60,    investedValue: 120000  },
  { symbol: 'NESTLEIND',  name: 'Nestlé India',                   pricePerShare: 2280.0,  sharesHeld: 60,    investedValue: 115000  },
  { symbol: 'TITAN',      name: 'Titan Company',                  pricePerShare: 3285.0,  sharesHeld: 45,    investedValue: 125000  },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',                  pricePerShare: 12450.0, sharesHeld: 15,    investedValue: 150000  },
  { symbol: 'EICHERMOT',  name: 'Eicher Motors (Royal Enfield)',  pricePerShare: 5120.0,  sharesHeld: 30,    investedValue: 130000  },
  { symbol: 'ASIANPAINT', name: 'Asian Paints',                   pricePerShare: 2350.0,  sharesHeld: 55,    investedValue: 110000  },

  // Pharma
  { symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',             pricePerShare: 1785.0,  sharesHeld: 80,    investedValue: 120000  },
  { symbol: 'DRREDDY',    name: "Dr. Reddy's Laboratories",       pricePerShare: 1285.0,  sharesHeld: 100,   investedValue: 105000  },
  { symbol: 'CIPLA',      name: 'Cipla',                          pricePerShare: 1520.0,  sharesHeld: 90,    investedValue: 115000  },
  { symbol: 'LUPIN',      name: 'Lupin',                          pricePerShare: 2140.0,  sharesHeld: 65,    investedValue: 120000  },
  { symbol: 'ZYDUSLIFE',  name: 'Zydus Lifesciences',             pricePerShare: 1025.0,  sharesHeld: 120,   investedValue: 100000  },

  // Metals & cement
  { symbol: 'TATASTEEL',  name: 'Tata Steel',                     pricePerShare: 156.8,   sharesHeld: 1200,  investedValue: 150000  },
  { symbol: 'JSWSTEEL',   name: 'JSW Steel',                      pricePerShare: 875.0,   sharesHeld: 180,   investedValue: 140000  },
  { symbol: 'VEDANTA',    name: 'Vedanta',                        pricePerShare: 445.0,   sharesHeld: 300,   investedValue: 110000  },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement',               pricePerShare: 11200.0, sharesHeld: 15,    investedValue: 130000  },

  // Real estate
  { symbol: 'DLF',        name: 'DLF Limited',                    pricePerShare: 810.0,   sharesHeld: 200,   investedValue: 135000  },
];

export function findStock(symbol: string): Stock | undefined {
  return STOCKS.find((s) => s.symbol === symbol);
}
