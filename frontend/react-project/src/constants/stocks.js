export const US_TECH_SYMBOLS = [
  "AAPL", "MSFT", "AMZN", "GOOGL", "GOOG", "META", "TSLA", "NVDA", "NFLX", "AMD",
  "INTC", "AVGO", "ADBE", "ORCL", "CRM", "CSCO", "QCOM", "TXN", "IBM", "AMAT",
  "MU", "PYPL", "UBER", "ABNB", "SHOP"
];

export const US_BLUECHIP_SYMBOLS = [
  "JPM", "BAC", "WFC", "GS", "MS", "C", "V", "MA", "AXP", "JNJ",
  "PFE", "MRK", "ABBV", "LLY", "UNH", "CVS", "WMT", "COST", "HD", "MCD",
  "KO", "PEP", "NKE", "DIS", "XOM", "CVX", "COP", "CAT", "BA", "GE",
  "F", "GM", "T", "VZ"
];

export const INDIAN_SYMBOLS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "AXISBANK",
  "KOTAKBANK", "HINDUNILVR", "MARUTI", "TATAMOTORS", "M&M", "SUNPHARMA", "NTPC", "POWERGRID", "ADANIENT", "ADANIPORTS",
  "TATASTEEL", "JSWSTEEL", "WIPRO", "TECHM", "HCLTECH", "ASIANPAINT", "BAJFINANCE", "BAJAJFINSV", "ULTRACEMCO", "TITAN"
];

export const ALL_TRACKED_SYMBOLS = [
  ...US_TECH_SYMBOLS,
  ...US_BLUECHIP_SYMBOLS,
  ...INDIAN_SYMBOLS
];

const INDIAN_SET = new Set(INDIAN_SYMBOLS);

export const isIndianStock = (symbol) => {
  if (!symbol) return false;
  return INDIAN_SET.has(symbol.toUpperCase());
};
