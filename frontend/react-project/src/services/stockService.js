import api from "./api";

export const getStock = async (symbol) => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/stocks/details/${cleanSymbol}`);
  return response.data;
};

export const getLiveQuote = async (symbol) => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/stocks/live/${cleanSymbol}`);
  return response.data;
};

export const getHistoricalData = async (symbol, timeframe = "1D") => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/stocks/${cleanSymbol}/historical?timeframe=${timeframe}`);
  return response.data;
};

export const searchStocks = async (query) => {
  const response = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getAllStocks = async () => {
  const response = await api.get("/stocks");
  return response.data;
};
