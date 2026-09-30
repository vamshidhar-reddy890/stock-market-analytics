import api from "./api";

export const getTechnicalIndicators = async (symbol) => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/analytics/indicators/${cleanSymbol}`);
  return response.data;
};

export const getRiskMetrics = async (symbol) => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/analytics/risk/${cleanSymbol}`);
  return response.data;
};

export const getSentiment = async (symbol) => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : "AAPL";
  const response = await api.get(`/sentiment/${cleanSymbol}`);
  return response.data;
};
