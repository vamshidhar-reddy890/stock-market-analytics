import api from "./api";

export const getPortfolio = async () => {
  const response = await api.get("/portfolios");
  return response.data;
};

export const addHolding = async (holdingData) => {
  const response = await api.post("/portfolios/holdings", holdingData);
  return response.data;
};

export const sellHolding = async (sellData) => {
  const response = await api.post("/portfolios/sell", sellData);
  return response.data;
};

export const deleteHolding = async (holdingId) => {
  const response = await api.delete(`/portfolios/holdings/${holdingId}`);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/portfolios/transactions");
  return response.data;
};

export const getPortfolioAnalytics = async () => {
  const response = await api.get("/portfolios");
  return response.data;
};