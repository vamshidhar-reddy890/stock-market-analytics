import api from "./api";

export const getWatchlist = async () => {
  const response = await api.get("/watchlist");
  return response.data;
};

export const addToWatchlist = async (symbol) => {
  const response = await api.post("/watchlist", { symbol });
  return response.data;
};

export const removeFromWatchlist = async (symbol) => {
  const response = await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
  return response.data;
};

export const checkInWatchlist = async (symbol) => {
  const response = await api.get(`/watchlist/check/${encodeURIComponent(symbol)}`);
  return response.data;
};
